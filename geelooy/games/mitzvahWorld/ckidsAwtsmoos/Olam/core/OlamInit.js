
/**
 * B"H
 * @module OlamInit
 * @description
 * 🚀 THE IGNITION SEQUENCE 🚀
 * 
 * Calls the profound initialization logic that prepares the DRACO loaders
 * and standard WebGL environments.
 */
import initLogic from "../init.js";

export default class OlamInit {
    static async execute(olam) {
        await initLogic(olam);
    }
}
