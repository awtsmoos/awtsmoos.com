// B"H
/**
 * @class UIManager
 * @description Chapter 47: The root UI vessel carries the refreshed game UI.
 */
import UI from "/scripts/awtsmoos/ui/index.js";
import style from "./ui/style.js?v=lean-l1-20260528-bh47";
import mainMenu from "./ui/mainMenu/index.js?v=lean-l1-20260528-bh47";

export default class UIManager {
  constructor() {}
  UI(opts = {}) {
    const ui = new UI(); this.ui = ui;
    const root = ui.html({ shaym: "ikar", children: [style, ...mainMenu] });
    root?.addEventListener("start", event => this.initializeForFirstTime(event, { onstart: opts.onstart, onerror: error => this.showStartError(ui, error) }));
    root?.addEventListener("olamPeula", event => this.forwardOlamPeula(event));
    document.body.appendChild(root); return ui;
  }
  showStartError(ui, error) { alert("There was an error " + error); ui.htmlAction({ shaym: "loading", properties: { innerHTML: "There was an error. Check console." } }); }
  forwardOlamPeula(event) {
    const detail = event?.detail, worker = window.mana?.socket?.eved;
    if (!worker || !detail) return console.warn('B"H | UI_MANAGER_FORWARD_FAILED', { hasWorker: Boolean(worker), detail });
    Object.keys(detail).forEach(key => worker.postMessage({ [key]: detail[key] }));
  }
  initializeForFirstTime(event, opts = {}) {
    const ui = this.ui; ui.html({ shaym: "main av", className: "mainAv" });
    const av = ui.html({ shaym: "av", style: { position: "relative" }, className: "mapAvBasic", parent: "main av", attributes: { awts: 2 } });
    this.parentForCanvas = av; ui.html({ parent: av, tag: "canvas", shaym: "canvasEssence" });
    const detail = event.detail || {};
    if (detail.worldDayuhURL) console.warn('B"H - Refused worldDayuhURL start payload:', detail.worldDayuhURL);
    if (!detail.worldDayuh || typeof detail.worldDayuh !== "object") { alert("No direct ladder world data provided."); return false; }
    const gameUiHTML = detail.gameUiHTML || window.awtsmoosGameUI;
    if (gameUiHTML && typeof gameUiHTML === "object" && !ui.$g("gameID")) ui.html(gameUiHTML);
    this.onerror = opts.onerror; if (this.started) return true; this.started = true;
    opts.onstart?.({ ...detail, gameUiHTML, worldDayuh: detail.worldDayuh }); return true;
  }
  makeGameMenu() {}
  gameMenuItem() {}
}
