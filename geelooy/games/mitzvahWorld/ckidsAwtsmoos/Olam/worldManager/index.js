// B"H
/**
 * @module ManagerOfAllWorlds
 * @description
 * Chapter 423: The manager no longer drinks stale worker paths.
 *
 * The Awtsmoos gathers UI, sockets, service workers, destruction, and start
 * flow into one manager. If this vessel imports old seals, the whole world can
 * boot an older Chossid. Every manager limb now drinks from the visible-root
 * binding seal.
 */
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js?compact=true&v=visible-root-binding-20260610-bh710";
import UIManager from "../uiManager/index.js?compact=true&v=village-polish-20260612-bh811";
import StartWorldFlow from "./StartWorldFlow.js?compact=true&v=village-polish-20260612-bh811";
import SocketHandler from "./SocketHandler.js?compact=true&v=visible-root-binding-20260610-bh710";
import ServiceWorkerInit from "./ServiceWorkerInit.js?compact=true&v=visible-root-binding-20260610-bh710";
import SwitchDestroyLogic from "./SwitchDestroyLogic.js?compact=true&v=visible-root-binding-20260610-bh710";
import DomHelpers from "./DomHelpers.js?compact=true&v=visible-root-binding-20260610-bh710";

export default class ManagerOfAllWorlds {
  gameState = {};
  started = false;
  ikarUI = null;

  /** @param {string|null} serviceWorkerPath Optional service worker path. */
  constructor(serviceWorkerPath) {
    DomHelpers.setupGlobalFunctions();
    const uiManager = new UIManager();
    this.uiManager = uiManager;
    this.ui = uiManager.UI({ onstart: ob => this.startWorld(ob) });
    if (serviceWorkerPath && typeof serviceWorkerPath === "string") this.registerServiceWorker(serviceWorkerPath);
  }
}

ChasveiAwtsmoos.emanate(ManagerOfAllWorlds.prototype, [StartWorldFlow, SocketHandler, ServiceWorkerInit, SwitchDestroyLogic]);
