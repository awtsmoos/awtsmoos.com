// B"H
/**
 * @class UIManager
 * @description Chapter 75: The root UI vessel carries the current start gate.
 * The Awtsmoos refuses stale menu imports during platform debugging because
 * the UI is the hand that dispatches `start` into the worker birth river.
 */
import UI from "/scripts/awtsmoos/ui/index.js";
import style from "./ui/style.js?v=wide-platform-real-boot-chain-20260529-bh75";
import mainMenu from "./ui/mainMenu/index.js?v=wide-platform-real-boot-chain-20260529-bh75";

export default class UIManager {
  constructor() {}

  /** @param {object} opts Start callbacks. @returns {object} Awts UI. */
  UI(opts = {}) {
    const ui = new UI();
    this.ui = ui;
    const root = ui.html({ shaym: "ikar", children: [style, ...mainMenu] });
    root?.addEventListener("start", event => this.initializeForFirstTime(event, { onstart: opts.onstart, onerror: error => this.showStartError(ui, error) }));
    root?.addEventListener("olamPeula", event => this.forwardOlamPeula(event));
    document.body.appendChild(root);
    return ui;
  }

  showStartError(ui, error) {
    alert("There was an error " + error);
    ui.htmlAction({ shaym: "loading", properties: { innerHTML: "There was an error. Check console." } });
  }

  forwardOlamPeula(event) {
    const detail = event?.detail;
    const worker = window.mana?.socket?.eved;
    if (!worker || !detail) return console.warn('B"H | UI_MANAGER_FORWARD_FAILED', { hasWorker: Boolean(worker), detail });
    Object.keys(detail).forEach(key => worker.postMessage({ [key]: detail[key] }));
  }

  initializeForFirstTime(event, opts = {}) {
    const ui = this.ui;
    ui.html({ shaym: "main av", className: "mainAv" });
    const av = ui.html({ shaym: "av", style: { position: "relative" }, className: "mapAvBasic", parent: "main av", attributes: { awts: 2 } });
    this.parentForCanvas = av;
    ui.html({ parent: av, tag: "canvas", shaym: "canvasEssence" });
    const detail = event.detail || {};
    if (detail.worldDayuhURL) console.warn('B"H - Refused worldDayuhURL start payload:', detail.worldDayuhURL);
    if (!detail.worldDayuh || typeof detail.worldDayuh !== "object") {
      alert("No direct ladder world data provided.");
      return false;
    }
    const gameUiHTML = detail.gameUiHTML || window.awtsmoosGameUI;
    if (gameUiHTML && typeof gameUiHTML === "object" && !ui.$g("gameID")) ui.html(gameUiHTML);
    this.onerror = opts.onerror;
    if (this.started) return true;
    this.started = true;
    opts.onstart?.({ ...detail, gameUiHTML, worldDayuh: detail.worldDayuh });
    return true;
  }

  makeGameMenu() {}
  gameMenuItem() {}
}
