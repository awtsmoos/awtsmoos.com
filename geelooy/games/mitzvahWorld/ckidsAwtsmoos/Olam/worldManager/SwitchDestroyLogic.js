// B"H
/**
 * @module SwitchDestroyLogic
 * @description
 * Chapter 89: worlds dissolve without killing the white-hot worker. The
 * Awtsmoos lets forms burn back into ayin: meshes, loops, collisions, and model
 * references are told to leave, while the same worker remains ready for the next
 * ladder chamber. No partial corpse. No duplicate canvas transfer.
 */
export default {
  /**
   * Requests world teardown and optionally keeps the worker manager alive.
   *
   * @param {object} [opts]
   * Teardown options.
   *
   * @param {boolean} [opts.keepWorker=false]
   * When true, preserve this.socket and reuse the same Worker thread.
   *
   * @returns {Promise<string|boolean>}
   * Destruction status.
   */
  async destroyWorld(opts = {}) {
    return new Promise(resolve => {
      if (!this.socket || !this.socket.eved) return resolve(false);
      const keepWorker = Boolean(opts.keepWorker);
      const previousHandler = this.socket.eved.onmessage;
      const finish = value => {
        this.socket.eved.onmessage = previousHandler;
        if (!keepWorker) delete this.socket;
        this.started = false;
        if (this.uiManager) this.uiManager.started = false;
        resolve(value);
      };
      const timer = setTimeout(() => finish("Destroy timeout; continuing with guarded reset"), 4500);
      this.socket.eved.onmessage = e => {
        if (e.data && e.data.destroyed) {
          clearTimeout(timer);
          finish("Destroyed; worker preserved=" + keepWorker);
          return;
        }
        if (typeof previousHandler === "function") previousHandler(e);
      };
      this.socket.postMessage({ destroyWorld: { keepWorker } });
    });
  },

  /**
   * Switches worlds through a careful teardown, keeping the worker when possible.
   *
   * @param {Object} opts
   * Switch payload.
   *
   * @returns {Promise<boolean>}
   * Whether the next world start was requested.
   */
  async switchWorlds({ worldDayuh, gameState, sourcePath, gameUiHTML } = {}) {
    if (gameState && gameState.shaym) this.gameState[gameState.shaym] = gameState;
    await this.destroyWorld({ keepWorker: true });
    const ld = this.ui.getHtml("loading");
    if (ld) this.ui.setHtml(ld, { className: "loading" });
    this.ui.htmlAction({ shaym: "action loading", properties: { innerHTML: "Resetting the world vessels..." } });
    return await this.startWorld({ worldDayuh, sourcePath, gameUiHTML, reuseWorker: true, alreadyDestroyed: true });
  }
};
