// B"H
/**
 * @class UIManager
 * @description
 * Chapter 6: The UI receives fresh styling and reset effects.
 *
 * The clean Level 1 UI still refuses Blob/custom-world starts, while the style
 * vessel is cache-busted so the repaired inventory and action bar CSS loads.
 */
import UI from "/scripts/awtsmoos/ui/index.js";
import style from "./ui/style.js?v=lean-l1-20260528-bh9";
import mainMenu from "./ui/mainMenu/index.js";

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

  makeGameMenu() {
    if (this.ui.$g("menu")) return;
    const par = this.ui.$g("gameID") || document.querySelector(".gameUi");
    if (!par) return;
    import("./ui/gameUI/MainMenu/index.js")
      .then(({ MainMenu }) => this.ui.html({ ...MainMenu, parent: par }))
      .catch(error => console.error('B"H: Failed to lazy-load in-game menu', error));
  }

  gameMenuItem() {}
}
