import { initializeServer } from "./app";
import { MultiplierGenerator } from "./services/game/multiplier/multiplier_generator";

initializeServer();

const multiplierGen = new MultiplierGenerator({
  clientSeedDetails: [
    { seed: "client1", userId: "user1" },
    { seed: "client2", userId: "user2" },
  ],
});
multiplierGen.generateServerSeed();
multiplierGen.generateFinalResults();
console.log(multiplierGen);
