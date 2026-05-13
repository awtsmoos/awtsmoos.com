// B"H
/**
 * @module ManagerOfAllWorlds
 * @description
 * THE OVERSEER OF ALL DIMENSIONS.
 *
 * "He builds worlds and destroys them." This class does both.
 *
 * TIKKUN: The serviceWorkerPath param passed here (oyvedEdom.js) is now
 * properly used to register the service worker - its actual purpose.
 */
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js";
import UIManager from "../uiManager/index.js";
import StartWorldFlow from "./StartWorldFlow.js";
import SocketHandler from "./SocketHandler.js";
import ServiceWorkerInit from "./ServiceWorkerInit.js";
import SwitchDestroyLogic from "./SwitchDestroyLogic.js";
import DomHelpers from "./DomHelpers.js";

export default class ManagerOfAllWorlds {
    gameState = {};
    started = false;
    ikarUI = null;

    /**
     * @constructor
     * @param {string} serviceWorkerPath - Path to the service worker (oyvedEdom.js).
     */
    constructor(serviceWorkerPath) {
        DomHelpers.setupGlobalFunctions();

        var self = this;
        var uiManager = new UIManager();
        this.uiManager = uiManager;

        var ui = uiManager.UI({
            onstart(ob) {
                // B"H: silent

                self.startWorld(ob);
            }
        });

        this.ui = ui;

        // B"H: Register the service worker - actual purpose of this param
        if (serviceWorkerPath && typeof serviceWorkerPath === "string") {
            this.registerServiceWorker(serviceWorkerPath);
        }

        var h = ui.$g("ikar");
        if (!h) {
            // B"H: silent

        }
    }
}

// B"H - Grafting the modular limbs onto the Overseer with Divine Emanation
ChasveiAwtsmoos.emanate(ManagerOfAllWorlds.prototype, [
    StartWorldFlow,
    SocketHandler,
    ServiceWorkerInit,
    SwitchDestroyLogic
]);
