// B"H

/**
 * @file StartWorldFlow.js
 * @description
 * THE UTTERANCE OF THE FIRST WORD.
 *
 * This module starts the world worker without poison query strings,
 * without unstable paths, and with explicit module-worker URLs.
 *
 * The main practical fix:
 * the worker path is now resolved with new URL(..., import.meta.url),
 * so localhost, subfolders, ngrok, and production all receive the same
 * correct absolute URL.
 */

import OlamWorkerManager from "../ikarOyvedManager.js";

/**
 * B"H
 * Data-only paths for the world flow.
 */
const WORLD_FLOW_PATHS = Object.freeze({
  WORKER_ENTRY: "../oyved/index.js",
  PLAYER_DATA: "desktop.folder/game data.folder/playerData.json"
});

/**
 * B"H
 * Start-world behavior grafted into ManagerOfAllWorlds.
 */
const StartWorldFlow = {
  /**
   * B"H
   * Starts the Mitzvah World worker.
   *
   * @param {Object} ob
   * Start options from the UI.
   *
   * @param {Object} [ob.worldDayuh]
   * Inline world data.
   *
   * @param {string} [ob.worldDayuhURL]
   * Blob or URL for world data module.
   *
   * @param {Object} [ob.gameUiHTML]
   * UI HTML data.
   *
   * @param {string} [ob.sourcePath]
   * Original source path for history.
   *
   * @returns {Promise<boolean>}
   * True when the worker start command was issued.
   */
  async startWorld(ob = {}) {
    const {
      worldDayuh,
      worldDayuhURL,
      gameUiHTML,
      sourcePath
    } = ob;

    if (sourcePath) this._rectifyHistory(sourcePath);

    const systemInfo = {
      html: {
        ...(worldDayuh?.html || {}),
        ...(gameUiHTML || {})
      },
      gameState: this.gameState,
      set: {
        playerSettings: await this._getPersistentSettings(),
        curAlias: window.curAlias || null
      },
      ...(worldDayuhURL ? { worldDayuhURL } : {})
    };

    const userInfo = worldDayuh && typeof worldDayuh === "object"
      ? { ...worldDayuh }
      : {};

    const canvas = this.ui.$g("canvasEssence");

    if (!canvas) {
      console.error('B"H - Canvas "canvasEssence" NOT FOUND!');
      return false;
    }

    const workerUrl = new URL(WORLD_FLOW_PATHS.WORKER_ENTRY, import.meta.url).href;

    console.log("B\"H - [WORLD_WORKER_URL]:", workerUrl);

    const managerOfAllWorlds = this;

    if (this.uiManager) {
      this.uiManager.started = false;
    }

    const manager = new OlamWorkerManager(
      workerUrl,
      {
        async pawsawch() {
          manager.postMessage({
            type: "pawsawch",
            payload: {
              userInfo,
              systemInfo
            }
          });
        }
      },
      canvas,
      this.ui
    );

    manager._managerOfAllWorlds = managerOfAllWorlds;
    this.socket = manager;
    this.setOnmessage();

    setTimeout(() => {
      if (!manager._vesselIsReady) {
        console.warn(
          'B"H - Diagnostic: Worker has not sent vessel_ready after 45s. ' +
          'Check module paths and MIME headers.'
        );
      } else if (!manager._pawsawchDispatched) {
        console.warn('B"H - Diagnostic: vessel_ready received but pawsawch not dispatched.');
      } else if (!manager._canvasTransferred) {
        console.warn('B"H - Diagnostic: Canvas not yet transferred. Meshes may still be forging.');
      }
    }, 45000);

    return true;
  },

  /**
   * B"H
   * Records current world path in browser history.
   *
   * @param {string} path
   * World source path.
   *
   * @returns {void}
   */
  _rectifyHistory(path) {
    window.currentWorldSourcePath = path;

    const url = new URL(window.location);
    url.searchParams.set("path", path);
    window.history.pushState({ path }, "", url);
  },

  /**
   * B"H
   * Loads persistent player settings for the current alias.
   *
   * @returns {Promise<Object|null>}
   * Parsed player data, or null.
   */
  async _getPersistentSettings() {
    if (!window.curAlias) return null;

    try {
      const p = encodeURIComponent(WORLD_FLOW_PATHS.PLAYER_DATA);
      const res = await fetch(
        `/api/social/aliases/${window.curAlias}/fileSystem/readFile?path=${p}`
      );

      if (!res.ok) return null;

      const json = await res.json();
      return json && !json.error ? json : null;
    } catch (error) {
      console.warn("B\"H - Persistent settings could not be loaded.", error);
      return null;
    }
  }
};

export default StartWorldFlow;