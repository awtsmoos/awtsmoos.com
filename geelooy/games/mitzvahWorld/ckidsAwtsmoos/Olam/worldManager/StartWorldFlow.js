// B"H
/**
 * @file StartWorldFlow.js
 * @description
 * Chapter 49: The World Flow Opened The Stable Worker Gate.
 *
 * The Awtsmoos cache-busts the manager that binds DOM input, ensuring mobile
 * joystick movement uses stable key-state deltas instead of repeated releases.
 */
import OlamWorkerManager from "../ikarOyvedManager.js?v=lava-camera-collision-bypass-20260609-bh643";

const WORLD_FLOW_PATHS = Object.freeze({
  WORKER_ENTRY: "../oyved/index.js",
  PLAYER_DATA: "desktop.folder/game data.folder/playerData.json"
});

const StartWorldFlow = {
  /** @param {object} ob Start payload. @returns {Promise<boolean>} */
  async startWorld(ob = {}) {
    const { worldDayuh, gameUiHTML, sourcePath } = ob;
    if (!worldDayuh || typeof worldDayuh !== "object") {
      console.error('B"H - startWorld refused: direct worldDayuh is required.');
      return false;
    }
    if (sourcePath) this._rectifyHistory(sourcePath);
    const systemInfo = await this._buildSystemInfo(worldDayuh, gameUiHTML);
    const userInfo = { ...worldDayuh };
    const canvas = this.ui.$g("canvasEssence");
    if (!canvas) {
      console.error('B"H - Canvas "canvasEssence" NOT FOUND!');
      return false;
    }
    this._prepareCanvas(canvas);
    if (this.socket?.eved) return await this._restartInsideExistingWorker({ userInfo, systemInfo });
    return await this._startFreshWorker(canvas, { userInfo, systemInfo });
  },

  /** @param {object} worldDayuh World data. @param {object} gameUiHTML UI data. @returns {Promise<object>} */
  async _buildSystemInfo(worldDayuh, gameUiHTML) {
    return {
      html: { ...(worldDayuh.html || {}), ...(gameUiHTML || {}) },
      gameState: this.gameState,
      set: { playerSettings: await this._getPersistentSettings(), curAlias: window.curAlias || null }
    };
  },

  /** @param {HTMLCanvasElement} canvas Canvas vessel. @returns {void} */
  _prepareCanvas(canvas) {
    canvas.style.display = "block";
    canvas.style.visibility = "visible";
    canvas.style.opacity = "1";
  },

  /** @param {HTMLCanvasElement} canvas Canvas. @param {object} payload Payload. @returns {Promise<boolean>} */
  async _startFreshWorker(canvas, payload) {
    const workerUrl = new URL(WORLD_FLOW_PATHS.WORKER_ENTRY, import.meta.url).href;
    if (this.uiManager) this.uiManager.started = false;
    const manager = new OlamWorkerManager(workerUrl, { async pawsawch() { manager.postMessage({ type: "pawsawch", payload }); } }, canvas, this.ui);
    manager._managerOfAllWorlds = this;
    this.socket = manager;
    this.setOnmessage();
    this._warnIfWorkerStalls(manager);
    return true;
  },

  /** @param {object} payload Fresh world payload. @returns {Promise<boolean>} */
  async _restartInsideExistingWorker(payload) {
    await this.destroyWorld({ keepWorker: true });
    const manager = this.socket;
    manager.customTawfeekeem.pawsawch = async () => manager.postMessage({ type: "pawsawch", payload });
    manager.runtime.pawsawchDispatched = false;
    manager.runtime.worldLoaded = false;
    manager._pawsawchDispatched = false;
    manager._worldLoaded = false;
    manager.runtime.opened = true;
    manager.opened = true;
    manager.processQueue();
    manager.postMessage({ type: "pawsawch", payload });
    this._warnIfWorkerStalls(manager);
    return true;
  },

  /** @param {string} path Source path. @returns {void} */
  _rectifyHistory(path) {
    window.currentWorldSourcePath = path;
    const url = new URL(window.location);
    url.searchParams.set("path", path);
    window.history.pushState({ path }, "", url);
  },

  /** @param {object} manager Worker manager. @returns {void} */
  _warnIfWorkerStalls(manager) {
    setTimeout(() => {
      if (!manager._vesselIsReady) console.warn('B"H - Worker has not sent vessel_ready after 90s.');
      else if (!manager._pawsawchDispatched) console.warn('B"H - vessel_ready received but pawsawch not dispatched.');
    }, 90000);
  },

  /** @returns {Promise<object|null>} Persistent settings. */
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
