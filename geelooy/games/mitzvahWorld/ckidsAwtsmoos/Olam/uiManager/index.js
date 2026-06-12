// B"H
/**
 * @class UIManager
 * @description Chapter 129: The UI root imports the centered guide and ray
 * grounding cache seal. The Awtsmoos keeps old clipped NPC panels from returning.
 */
import UI from "/scripts/awtsmoos/ui/index.js";
import style from "./ui/style.js?v=ray-ground-ui-20260602-bh129";
import mainMenu from "./ui/mainMenu/index.js?v=village-polish-20260612-bh810";

export default class UIManager {
  constructor() {}

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
    if (!detail.worldDayuh || typeof detail.worldDayuh !== "object") { alert("No direct ladder world data provided."); return false; }
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
