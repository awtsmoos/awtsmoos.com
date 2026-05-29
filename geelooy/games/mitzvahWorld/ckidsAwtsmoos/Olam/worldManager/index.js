// B"H
/** @module ManagerOfAllWorlds @description Chapter 53 refreshed UI and texture gate. */
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js";
import UIManager from "../uiManager/index.js?v=lean-l1-20260528-bh53";
import StartWorldFlow from "./StartWorldFlow.js?v=lean-l1-20260528-bh50";
import SocketHandler from "./SocketHandler.js?v=lean-l1-20260528-bh50";
import ServiceWorkerInit from "./ServiceWorkerInit.js?v=lean-l1-20260528-bh50";
import SwitchDestroyLogic from "./SwitchDestroyLogic.js?v=lean-l1-20260528-bh50";
import DomHelpers from "./DomHelpers.js?v=lean-l1-20260528-bh50";

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
