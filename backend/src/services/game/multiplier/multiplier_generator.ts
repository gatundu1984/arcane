import crypto from "crypto";

interface ClientSeedDetails {
  seed: string;
  userId: string;
}

interface MultiplierState {
  serverSeed: string | null;
  hashedServerSeed: string | null;
  clientSeed: string;
  clientSeedDetails: ClientSeedDetails[];
  hash: string | null;
  hashNumber: number | null;
  multiplier: number | null;
}

interface MultiplierGeneratorDep {
  clientSeedDetails: ClientSeedDetails[];
}

/**
 * Generates provably fair multipliers using cryptographic hashing.
 *
 * Process:
 * 1. generateServerSeed() - Returns hash commitment before round starts
 * 2. generateFinalResults() - Combines seeds and calculates multiplier
 */
export class MultiplierGenerator {
  private static readonly MIN_MULTIPLIER = 1;
  private static readonly MAX_MULTIPLIER = 1000;
  // 13 hex chars = 52 bits (stays within Number.MAX_SAFE_INTEGER)
  private static readonly HASH_SLICE_LEN = 13;

  private readonly state: MultiplierState;

  constructor({ clientSeedDetails }: MultiplierGeneratorDep) {
    if (clientSeedDetails.length === 0) {
      throw new Error("Client seed details must never be of length zero");
    }

    let combinedClientSeeds = "";
    clientSeedDetails.forEach((seedDetail) => {
      combinedClientSeeds += seedDetail.seed;
    });

    this.state = {
      serverSeed: null,
      hashedServerSeed: null,
      clientSeed: combinedClientSeeds,
      clientSeedDetails,
      hash: null,
      hashNumber: null,
      multiplier: null,
    };
  }

  public generateServerSeed(): string {
    const serverSeed = crypto.randomBytes(30).toString("base64");
    const hashedServerSeed = crypto
      .createHash("sha256")
      .update(serverSeed)
      .digest("hex");

    this.state.serverSeed = serverSeed;
    this.state.hashedServerSeed = hashedServerSeed;

    return hashedServerSeed;
  }

  public generateFinalResults(): MultiplierState {
    this.generateHash();
    this.calculateMultiplier();
    return { ...this.state };
  }

  private generateHash(): void {
    if (!this.state.serverSeed) {
      throw new Error("Server seed must be generated before generating hash");
    }

    const combinedSeeds = `${this.state.serverSeed}${this.state.clientSeed}`;
    const hash = crypto
      .createHash("sha256")
      .update(combinedSeeds)
      .digest("hex");

    this.state.hash = hash;
  }

  private calculateMultiplier(): void {
    if (!this.state.hash) {
      throw new Error("Hash must be generated before calculating mutiplier");
    }

    const slicedHash = this.state.hash.slice(
      0,
      MultiplierGenerator.HASH_SLICE_LEN
    );
    const hashNumber = parseInt(slicedHash, 16);

    // Calculate max value (1 byte = 2 hex chars)
    const numBytes = slicedHash.length / 2;
    const numBits = numBytes * 8;
    const maxHashValue = Math.pow(2, numBits) - 1;

    const normalizedValue = hashNumber / maxHashValue;

    // Multiplier will never be less that 1
    let multiplier = 1 / (1 - normalizedValue);

    // Cap at maximum
    if (multiplier > MultiplierGenerator.MAX_MULTIPLIER) {
      multiplier = MultiplierGenerator.MAX_MULTIPLIER;
    }

    this.state.hashNumber = hashNumber;
    this.state.multiplier = +multiplier.toFixed(2);
  }
}
