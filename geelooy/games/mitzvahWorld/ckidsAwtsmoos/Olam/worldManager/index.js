
/**
 * B"H
 * @module ManagerOfAllWorlds
 * @description
 * Like the infinite orchestrator of the multiverse, this class oversees the genesis, 
 * destruction, and transition of all Olamot (Worlds). It sets up the UI, handles the 
 * web workers (the "Angels" doing the heavy lifting), and processes global state.
 */
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
     * @param {string} workerPath - The path to the angel (worker) that will weave the physical laws.
     */
    constructor(workerPath) {
        DomHelpers.setupGlobalFunctions();
      
        var self = this;
        var uiManager = new UIManager();
        this.uiManager = uiManager;
        var ui = uiManager.UI({
            onstart(ob) {
                console.log("STARTED");
                self.startWorld(ob);
            }
        });
        this.ui = ui;
        
        var h = ui.$g("ikar");
        if(!h) {
            console.log("Main menu not found");
        }
    }
}

Object.assign(ManagerOfAllWorlds.prototype, StartWorldFlow);
Object.assign(ManagerOfAllWorlds.prototype, SocketHandler);
Object.assign(ManagerOfAllWorlds.prototype, ServiceWorkerInit);
Object.assign(ManagerOfAllWorlds.prototype, SwitchDestroyLogic);
