// B"H
/**
 * @module ManagerOfAllWorlds
 * @description
 * Chapter 6: The manager opens the fresh UI and direct worker flow.
 */
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js";
import UIManager from "../uiManager/index.js?v=lean-l1-20260528-bh9";
import StartWorldFlow from "./StartWorldFlow.js";
import SocketHandler from "./SocketHandler.js";
import ServiceWorkerInit from "./ServiceWorkerInit.js";
import SwitchDestroyLogic from "./SwitchDestroyLogic.js";
import DomHelpers from "./DomHelpers.js";

export default class ManagerOfAllWorlds {
  gameState = {};
  started = false;
  ikarUI = null;

  constructor(serviceWorkerPath) {
    DomHelpers.setupGlobalFunctions();
    const uiManager = new UIManager();
    this.uiManager = uiManager;
    this.ui = uiManager.UI({ onstart: ob => this.startWorld(ob) });
    if (serviceWorkerPath && typeof serviceWorkerPath === "string") this.registerServiceWorker(serviceWorkerPath);
  }
}

ChasveiAwtsmoos.emanate(ManagerOfAllWorlds.prototype, [
  StartWorldFlow,
  SocketHandler,
  ServiceWorkerInit,
  SwitchDestroyLogic
]);
