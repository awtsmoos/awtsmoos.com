// B"H
/** @module ManagerOfAllWorlds @description Worker start flow drinks from bh9 no-alert jump seal. */
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js?v=visible-root-binding-20260610-bh710";
import UIManager from "../uiManager/index.js?v=no-compact-engine-20260702-bh2";
import StartWorldFlow from "./StartWorldFlow.js?v=no-compact-engine-20260702-bh2";
import SocketHandler from "./SocketHandler.js?v=visible-root-binding-20260610-bh710";
import ServiceWorkerInit from "./ServiceWorkerInit.js?v=visible-root-binding-20260610-bh710";
import SwitchDestroyLogic from "./SwitchDestroyLogic.js?v=visible-root-binding-20260610-bh710";
import DomHelpers from "./DomHelpers.js?v=visible-root-binding-20260610-bh710";
export default class ManagerOfAllWorlds { gameState = {}; started = false; ikarUI = null; constructor(serviceWorkerPath) { DomHelpers.setupGlobalFunctions(); const uiManager = new UIManager(); this.uiManager = uiManager; this.ui = uiManager.UI({ onstart: ob => this.startWorld(ob) }); if (serviceWorkerPath && typeof serviceWorkerPath === "string") this.registerServiceWorker(serviceWorkerPath); } }
ChasveiAwtsmoos.emanate(ManagerOfAllWorlds.prototype, [StartWorldFlow, SocketHandler, ServiceWorkerInit, SwitchDestroyLogic]);
