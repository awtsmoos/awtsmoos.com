// B"H
/** @class UIManager @description UI root with no blocking alerts. */
import UI from "/scripts/awtsmoos/ui/index.js";
import style from "./ui/style.js?v=ray-ground-ui-20260602-bh129";
import mainMenu from "./ui/mainMenu/index.js?v=direct-worker-actionbar-roots-main-20260615-bh916";
function warnNoDialog(label, detail) { console.error('B"H | UI_MANAGER_NOTICE_NO_DIALOG', { label, detail }); }
export default class UIManager {
  constructor() {}
  UI(opts = {}) { const ui = new UI(); this.ui = ui; const root = ui.html({ shaym:"ikar", children:[style, ...mainMenu] }); root?.addEventListener("start", event => this.initializeForFirstTime(event, { onstart:opts.onstart, onerror:error => this.showStartError(ui, error) })); root?.addEventListener("olamPeula", event => this.forwardOlamPeula(event)); document.body.appendChild(root); return ui; }
  showStartError(ui, error) { warnNoDialog("start-error", error?.message || String(error)); ui.htmlAction({ shaym:"loading", properties:{ innerHTML:"There was an error. Check console; no blocking dialog was opened." } }); }
  forwardOlamPeula(event) { const detail = event?.detail, worker = window.mana?.socket?.eved; if (!worker || !detail) return warnNoDialog("forward-failed", { hasWorker:Boolean(worker), detail }); Object.keys(detail).forEach(key => worker.postMessage({ [key]:detail[key] })); }
  initializeForFirstTime(event, opts = {}) { const ui = this.ui; ui.html({ shaym:"main av", className:"mainAv" }); const av = ui.html({ shaym:"av", style:{ position:"relative" }, className:"mapAvBasic", parent:"main av", attributes:{ awts:2 } }); this.parentForCanvas = av; ui.html({ parent:av, tag:"canvas", shaym:"canvasEssence" }); const detail = event.detail || {}; if (detail.worldDayuhURL) warnNoDialog("refused-url-payload", detail.worldDayuhURL); if (!detail.worldDayuh || typeof detail.worldDayuh !== "object") { warnNoDialog("missing-world-data", detail); return false; } const gameUiHTML = detail.gameUiHTML || window.awtsmoosGameUI; if (gameUiHTML && typeof gameUiHTML === "object" && !ui.$g("gameID")) ui.html(gameUiHTML); this.onerror = opts.onerror; if (this.started) return true; this.started = true; opts.onstart?.({ ...detail, gameUiHTML, worldDayuh:detail.worldDayuh }); return true; }
  makeGameMenu() {}
  gameMenuItem() {}
}
