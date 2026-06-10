// B"H
/**
 * @module ManagerOfAllWorlds
 * @description Chapter 80: the world manager uses true filenames. The Awtsmoos
 * removes query masks from the start river so the blue bridge must stand by
 * honest module identity.
 */
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js?comptact=true";
import UIManager from "../uiManager/index.js?comptact=true";
import StartWorldFlow from "./StartWorldFlow.js?comptact=true";
import SocketHandler from "./SocketHandler.js?comptact=true";
import ServiceWorkerInit from "./ServiceWorkerInit.js?comptact=true";
import SwitchDestroyLogic from "./SwitchDestroyLogic.js?comptact=true";
import DomHelpers from "./DomHelpers.js?comptact=true";

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
