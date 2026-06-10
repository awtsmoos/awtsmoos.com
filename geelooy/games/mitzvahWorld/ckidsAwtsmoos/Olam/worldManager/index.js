// B"H
/**
 * @module ManagerOfAllWorlds
 * @description Chapter 82: The manager imports the wall-direct mobile start river.
 */
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js?compact=true&v=wall-direct-mobile-move-20260610-bh705";
import UIManager from "../uiManager/index.js?compact=true&v=wall-direct-mobile-move-20260610-bh705";
import StartWorldFlow from "./StartWorldFlow.js?compact=true&v=wall-direct-mobile-move-20260610-bh705";
import SocketHandler from "./SocketHandler.js?compact=true&v=wall-direct-mobile-move-20260610-bh705";
import ServiceWorkerInit from "./ServiceWorkerInit.js?compact=true&v=wall-direct-mobile-move-20260610-bh705";
import SwitchDestroyLogic from "./SwitchDestroyLogic.js?compact=true&v=wall-direct-mobile-move-20260610-bh705";
import DomHelpers from "./DomHelpers.js?compact=true&v=wall-direct-mobile-move-20260610-bh705";

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

ChasveiAwtsmoos.emanate(ManagerOfAllWorlds.prototype, [StartWorldFlow, SocketHandler, ServiceWorkerInit, SwitchDestroyLogic]);
