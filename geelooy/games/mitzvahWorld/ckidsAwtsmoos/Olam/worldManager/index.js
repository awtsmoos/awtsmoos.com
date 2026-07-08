// B"H
/**
 * @module ManagerOfAllWorlds
 * @description Starts direct world loads without importing the full menu graph.
 */
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js?compact=true&v=visible-root-binding-20260610-bh710";
import StartWorldFlow from "./StartWorldFlow.js?compact=true&v=final-proof-bridge-20260705-bh4";
import SocketHandler from "./SocketHandler.js?compact=true&v=visible-root-binding-20260610-bh710";
import ServiceWorkerInit from "./ServiceWorkerInit.js?compact=true&v=visible-root-binding-20260610-bh710";
import SwitchDestroyLogic from "./SwitchDestroyLogic.js?compact=true&v=visible-root-binding-20260610-bh710";
import DomHelpers from "./DomHelpers.js?compact=true&v=visible-root-binding-20260610-bh710";

function hasDirectWorldPath() {
  try {
    const params = new URLSearchParams(location.search || "");
    return params.has("path") || params.get("compact") === "true";
  } catch {
    return true;
  }
}

function nodeKey(value) {
  return String(value || "").trim();
}

function makeNode(def = {}) {
  const tag = def.tag || "div";
  const node = tag === "canvas" ? document.createElement("canvas") : document.createElement(tag);
  if (def.shaym) node.setAttribute("shaym", def.shaym);
  if (def.id) node.id = def.id;
  if (def.className) node.className = def.className;
  if (def.style) Object.assign(node.style, def.style);
  if (def.textContent != null) node.textContent = String(def.textContent);
  return node;
}

function createFastUi(onstart) {
  const nodes = new Map();
  const ikar = document.getElementById("ikar") || document.body.appendChild(makeNode({ id:"ikar", shaym:"ikar" }));
  nodes.set("ikar", ikar);
  window.awtsmoosGameUI ||= { shaym:"gameID", className:"gameUi", children:[] };
  const ui = {
    $g(name) { return nodes.get(nodeKey(name)) || document.querySelector(`[shaym="${CSS.escape(nodeKey(name))}"]`) || null; },
    html(def = {}) {
      const parent = typeof def.parent === "string" ? ui.$g(def.parent) : def.parent || ikar;
      const node = makeNode(def);
      if (def.shaym) nodes.set(nodeKey(def.shaym), node);
      parent?.appendChild?.(node);
      return node;
    },
    htmlAction(action = {}) {
      const node = ui.$g(action.shaym);
      if (!node) return null;
      if (action.properties) Object.assign(node, action.properties);
      if (action.style) Object.assign(node.style, action.style);
      return node;
    }
  };
  ikar.addEventListener("start", event => {
    const detail = event.detail || {};
    if (!ui.$g("main av")) ui.html({ shaym:"main av", className:"mainAv", parent:ikar });
    if (!ui.$g("av")) ui.html({ shaym:"av", className:"mapAvBasic", parent:"main av", style:{ position:"relative" } });
    if (!ui.$g("canvasEssence")) ui.html({ tag:"canvas", shaym:"canvasEssence", parent:"av" });
    onstart?.({ ...detail, gameUiHTML:detail.gameUiHTML || window.awtsmoosGameUI });
  });
  return ui;
}

export default class ManagerOfAllWorlds {
  gameState = {};
  started = false;
  ikarUI = null;

  constructor(serviceWorkerPath) {
    DomHelpers.setupGlobalFunctions();
    this.uiManager = { started:false, fastDirect:true, makeGameMenu() {}, gameMenuItem() {} };
    this.ui = createFastUi(ob => this.startWorld(ob));
    if (!hasDirectWorldPath()) this._loadFullUi();
    if (serviceWorkerPath && typeof serviceWorkerPath === "string") this.registerServiceWorker(serviceWorkerPath);
  }

  async _loadFullUi() {
    try {
      const { default:UIManager } = await import("../uiManager/index.js?compact=true&v=lazy-menu-fast-boot-20260706-bh1");
      if (this.socket?.eved || this.started) return;
      const uiManager = new UIManager();
      this.uiManager = uiManager;
      this.ui = uiManager.UI({ onstart:ob => this.startWorld(ob) });
    } catch (error) {
      console.warn('B"H full UI menu deferred after fast manager boot failed', error);
    }
  }
}

ChasveiAwtsmoos.emanate(ManagerOfAllWorlds.prototype, [StartWorldFlow, SocketHandler, ServiceWorkerInit, SwitchDestroyLogic]);
