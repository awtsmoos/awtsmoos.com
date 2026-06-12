// B"H
/** @module ManagerOfAllWorlds @description Chapter 426: manager imports Android settings start flow. */
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js?compact=true&v=visible-root-binding-20260610-bh710";
import UIManager from "../uiManager/index.js?compact=true&v=android-settings-ui-20260612-bh1";
import StartWorldFlow from "./StartWorldFlow.js?compact=true&v=android-start-flow-20260612-bh1";
import SocketHandler from "./SocketHandler.js?compact=true&v=visible-root-binding-20260610-bh710";
import ServiceWorkerInit from "./ServiceWorkerInit.js?compact=true&v=visible-root-binding-20260610-bh710";
import SwitchDestroyLogic from "./SwitchDestroyLogic.js?compact=true&v=visible-root-binding-20260610-bh710";
import DomHelpers from "./DomHelpers.js?compact=true&v=visible-root-binding-20260610-bh710";
export default class ManagerOfAllWorlds { gameState = {}; started = false; ikarUI = null; constructor(serviceWorkerPath) { DomHelpers.setupGlobalFunctions(); const uiManager = new UIManager(); this.uiManager = uiManager; this.ui = uiManager.UI({ onstart: ob => this.startWorld(ob) }); if (serviceWorkerPath && typeof serviceWorkerPath === "string") this.registerServiceWorker(serviceWorkerPath); } }
ChasveiAwtsmoos.emanate(ManagerOfAllWorlds.prototype, [StartWorldFlow, SocketHandler, ServiceWorkerInit, SwitchDestroyLogic]);
