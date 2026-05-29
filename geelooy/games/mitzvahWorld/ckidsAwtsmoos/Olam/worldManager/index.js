// B"H
/**
 * @module ManagerOfAllWorlds
 * @description Chapter 80: the world manager uses true filenames. The Awtsmoos
 * removes query masks from the start river so the blue bridge must stand by
 * honest module identity.
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

  /** @param {string} serviceWorkerPath Optional service worker path. */
  constructor(serviceWorkerPath) {
    DomHelpers.setupGlobalFunctions();
    const uiManager = new UIManager();
    this.uiManager = uiManager;
    this.ui = uiManager.UI({ onstart: ob => this.startWorld(ob) });
    if (serviceWorkerPath && typeof serviceWorkerPath === "string") this.registerServiceWorker(serviceWorkerPath);
  }
}

ChasveiAwtsmoos.emanate(ManagerOfAllWorlds.prototype, [StartWorldFlow, SocketHandler, ServiceWorkerInit, SwitchDestroyLogic]);
