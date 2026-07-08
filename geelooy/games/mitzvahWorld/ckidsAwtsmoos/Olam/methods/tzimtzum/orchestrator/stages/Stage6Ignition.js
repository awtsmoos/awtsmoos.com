
/**
 * B"H
 * @module Stage6Ignition
 * @description
 * Routes the final ignition phase to the highly organized GameStarter modules.
 */
import GameStarterHub from "../../gameStarter/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class Stage6Ignition {
    static async ignite(olam, info) {
        // B"H: silent

        return await GameStarterHub.start(olam, info);
    }
}
