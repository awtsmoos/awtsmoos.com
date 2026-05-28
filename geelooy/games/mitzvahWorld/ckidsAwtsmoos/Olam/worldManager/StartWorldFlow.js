// B"H
/**
 * @file StartWorldFlow.js
 * @description Chapter 12: Direct world data enters the bh17 worker.
 */
import OlamWorkerManager from "../ikarOyvedManager.js";

const WORLD_FLOW_PATHS = Object.freeze({
  WORKER_ENTRY: "../oyved/index.js?v=lean-l1-20260528-bh17",
  PLAYER_DATA: "desktop.folder/game data.folder/playerData.json"
});

const StartWorldFlow = {
  /** Starts the Mitzvah World worker from direct world data only. */
  async startWorld(ob = {}) {
    const { worldDayuh, gameUiHTML, sourcePath } = ob;
    if (!worldDayuh || typeof worldDayuh !== "object") {
      console.error('B"H - startWorld refused: direct worldDayuh is required.');
      return false;
    }
    if (ob.worldDayuhURL) console.warn('B"H - startWorld ignored forbidden worldDayuhURL:', ob.worldDayuhURL);
    if (sourcePath) this._rectifyHistory(sourcePath);

    const systemInfo = {
      html: { ...(worldDayuh.html || {}), ...(gameUiHTML || {}) },
      gameState: this.gameState,
      set: { playerSettings: await this._getPersistentSettings(), curAlias: window.curAlias || null }
    };
    const userInfo = { ...worldDayuh };
    const canvas = this.ui.$g("canvasEssence");
    if (!canvas) {
      console.error('B"H - Canvas "canvasEssence" NOT FOUND!');
      return false;
    }

    canvas.style.display = "block";
    canvas.style.visibility = "visible";
    canvas.style.opacity = "1";

    const workerUrl = new URL(WORLD_FLOW_PATHS.WORKER_ENTRY, import.meta.url).href;
    console.log("B\"H - [WORLD_WORKER_URL]:", workerUrl);
    if (this.uiManager) this.uiManager.started = false;

    const manager = new OlamWorkerManager(workerUrl, {
      async pawsawch() {
        manager.postMessage({ type: "pawsawch", payload: { userInfo, systemInfo } });
      }
    }, canvas, this.ui);

    manager._managerOfAllWorlds = this;
    this.socket = manager;
    this.setOnmessage();
    this._warnIfWorkerStalls(manager);
    return true;
  },

  _rectifyHistory(path) {
    window.currentWorldSourcePath = path;
    const url = new URL(window.location);
    url.searchParams.set("path", path);
    window.history.pushState({ path }, "", url);
  },

  _warnIfWorkerStalls(manager) {
    setTimeout(() => {
      if (!manager._vesselIsReady) console.warn('B"H - Worker has not sent vessel_ready after 90s.');
      else if (!manager._pawsawchDispatched) console.warn('B"H - vessel_ready received but pawsawch not dispatched.');
      else if (!manager._canvasTransferred) console.info('B"H - Canvas not yet transferred. Meshes may still be forging.');
    }, 90000);
  },

  async _getPersistentSettings() {
    if (!window.curAlias) return null;
    try {
      const p = encodeURIComponent(WORLD_FLOW_PATHS.PLAYER_DATA);
      const res = await fetch(`/api/social/aliases/${window.curAlias}/fileSystem/readFile?path=${p}`);
      if (!res.ok) return null;
      const text = await res.text();
      if (!text.trim()) return null;
      const json = JSON.parse(text);
      return json && !json.error ? json : null;
    } catch (error) {
      console.warn("B\"H - Persistent settings could not be loaded.", error);
      return null;
    }
  }
};

export default StartWorldFlow;
