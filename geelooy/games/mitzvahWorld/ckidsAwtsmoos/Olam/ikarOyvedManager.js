
/**
 * B"H
 * @file ikarOyvedManager.js
 * @description
 * Thin modular main-thread Worker manager.
 */

import Utils from "../utils.js";
import UI from "/scripts/awtsmoos/ui/index.js";
import setupDomEvents from "./worker/domEvents.js";
import setupMessageHandler from "./worker/messageHandler.js";
import { createModuleWorker } from "./ikarOyvedManager/worker/WorkerCreator.js";
import { attachWorkerErrorEvents } from "./ikarOyvedManager/worker/WorkerErrorEvents.js";
import { interceptWorkerMessage } from "./ikarOyvedManager/messages/WorkerMessageInterceptor.js";
import { WorkerQueue } from "./ikarOyvedManager/queue/WorkerQueue.js";
import { WorkerRuntimeState } from "./ikarOyvedManager/state/WorkerRuntimeState.js";
import { oyvedManagerLog } from "./ikarOyvedManager/log/MainTextLogger.js";
import { startWorkerProgressWatchdog } from "./ikarOyvedManager/watch/WorkerProgressWatchdog.js";

/**
 * B"H
 * Main Worker manager.
 */
export default class OlamWorkerManager {
  /**
   * B"H
   * @param {string} workerPath
   * Worker path.
   *
   * @param {Object} options
   * Callbacks.
   *
   * @param {HTMLCanvasElement} canvasElement
   * Canvas.
   *
   * @param {Object} ui
   * UI.
   */
  constructor(workerPath, options = {}, canvasElement, ui) {
    this.workerPath = workerPath;
    this.customTawfeekeem = options;
    this.canvasElement = canvasElement;
    this.myUi = ui || new UI();
    this.queue = new WorkerQueue();
    this.runtime = new WorkerRuntimeState();

    this._vesselIsReady = false;
    this._pawsawchDispatched = false;
    this._worldLoaded = false;
    this._canvasTransferred = false;

    window.ui = this.myUi;

    this.eved = createModuleWorker(workerPath);
    attachWorkerErrorEvents(this.eved, workerPath);

    setupMessageHandler(this);
    setupDomEvents(this);

    this.eved.onmessage = event => {
      this.runtime.touch();
      interceptWorkerMessage(this, event);
      this.handleMessageEvent(event);
    };

    this._initStagnationWatch();
    startWorkerProgressWatchdog(this);
  }

  /**
   * B"H
   * Legacy opened getter.
   *
   * @returns {boolean}
   * Opened.
   */
  get opened() {
    return this.runtime.opened;
  }

  /**
   * B"H
   * Legacy opened setter.
   *
   * @param {boolean} value
   * Value.
   *
   * @returns {void}
   */
  set opened(value) {
    this.runtime.opened = Boolean(value);
  }

  /**
   * B"H
   * Dispatches first creation message.
   *
   * @returns {Promise<void>}
   */
  async _dispatchPawsawch() {
    if (this.runtime.pawsawchDispatched || this._pawsawchDispatched) return;

    this.runtime.pawsawchDispatched = true;
    this.runtime.opened = true;
    this._pawsawchDispatched = true;
    this.opened = true;

    this.processQueue();

    try {
      if (typeof this.customTawfeekeem.pawsawch === "function") {
        await this.customTawfeekeem.pawsawch();
      }
    } catch (error) {
      oyvedManagerLog.error("pawsawch dispatch failed", {
        message: error?.message || String(error),
        stack: String(error?.stack || "no stack").replace(/\s+/g, " ")
      });
    }
  }

  /**
   * B"H
   * Posts or queues Worker message.
   *
   * @param {Object} data
   * Data.
   *
   * @param {Transferable[]} transfer
   * Transfers.
   *
   * @returns {void}
   */
  postMessage(data, transfer = []) {
    let dayuh = data;

    try {
      if (dayuh && typeof dayuh === "object") {
        dayuh = Utils.stringifyFunctions(data);
      }

      const action = () => {
        this.eved.postMessage(dayuh, transfer.length > 0 ? transfer : undefined);
      };

      if (!this.runtime.opened) {
        this.queue.add(action);
        return;
      }

      action();
    } catch (error) {
      oyvedManagerLog.error("Worker postMessage failed", {
        message: error?.message || String(error),
        stack: String(error?.stack || "no stack").replace(/\s+/g, " ")
      });
    }
  }

  /**
   * B"H
   * Flushes queued messages.
   *
   * @returns {void}
   */
  processQueue() {
    try {
      this.queue.flush();
    } catch (error) {
      oyvedManagerLog.error("Worker queue flush failed", {
        message: error?.message || String(error),
        stack: String(error?.stack || "no stack").replace(/\s+/g, " ")
      });
    }
  }

  /**
   * B"H
   * Watches Worker silence.
   *
   * @returns {void}
   */
  _initStagnationWatch() {
    const check = () => {
      const silence = this.runtime.silenceMs();

      if ((this.runtime.vesselIsReady || this._vesselIsReady) && silence > 25000 && !this.runtime.worldLoaded && !this._worldLoaded) {
        oyvedManagerLog.error("Worker silent after vessel ready", {
          seconds: Math.floor(silence / 1000),
          workerPath: this.workerPath
        });
      }

      setTimeout(check, 5000);
    };

    setTimeout(check, 10000);
  }
}
