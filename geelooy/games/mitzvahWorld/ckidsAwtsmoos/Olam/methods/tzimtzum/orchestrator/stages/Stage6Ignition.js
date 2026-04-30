
/**
 * B"H
 * @module Stage6Ignition
 * @description
 * Routes the final ignition phase to the highly organized GameStarter modules.
 */
import GameStarterHub from "../../gameStarter/index.js";

export default class Stage6Ignition {
    static async ignite(olam, info) {
        console.log("B\"H - 🌌 STAGE 6: Igniting the engine.");
        return await GameStarterHub.start(olam, info);
    }
}
