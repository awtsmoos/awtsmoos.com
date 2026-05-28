// B"H
/**
 * @class UIManager
 * @description
 * Chapter 16: The UI manager pours compact bh20 Level 1 vessels.
 *
 * The Awtsmoos restores inventory and action names while keeping their bodies
 * small. Nothing screams missing vessel; nothing devours the view.
 */
import UI from "/scripts/awtsmoos/ui/index.js";
import style from "./ui/style.js?v=lean-l1-20260528-bh22";
import mainMenu from "./ui/mainMenu/index.js?v=lean-l1-20260528-bh22";

export default class UIManager {
  constructor() {}

  UI(opts = {}) {
    const ui = new UI();
    this.ui = ui;
    const h = ui.html({ shaym: "ikar", children: [style, ...mainMenu] });
    h?.addEventListener("start", event => this.initializeForFirstTime(event, {
      onstart: opts.onstart,
      onerror: error => this.showStartError(ui, error)
    }));
    h?.addEventListener("olamPeula", peula => this.forwardOlamPeula(peula));
    document.body.appendChild(h);
    return ui;
  }

  showStartError(ui, error) {
    alert("There was an error " + error);
    ui.htmlAction({ shaym: "loading", properties: { innerHTML: "There was an error. Check console." } });
  }

  forwardOlamPeula(peula) {
    const det = peula.detail;
    const manager = window.mana;
    if (manager?.socket?.eved && det) {
      Object.keys(det).forEach(key => manager.socket.eved.postMessage({ [key]: det[key] }));
      return;
    }
    console.warn('B"H - UI_MANAGER: Cannot post to Worker. socket or eved missing.');
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
