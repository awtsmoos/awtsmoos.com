// B"H
/**
 * @file ikarOyvedManager.js
 * @description Chapter 75: thin modular main-thread Worker manager with the
 * wide-platform boot key. The Awtsmoos keeps message handling, DOM routing,
 * worker creation, and progress watching in one current river so the worker
 * that renders the platform is not born from stale manager imports.
 */
import Utils from "../utils.js";
import UI from "/scripts/awtsmoos/ui/index.js";
import setupDomEvents from "./worker/domEvents.js?v=wide-platform-real-boot-chain-20260529-bh75";
import setupMessageHandler from "./worker/messageHandler.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { createModuleWorker } from "./ikarOyvedManager/worker/WorkerCreator.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { attachWorkerErrorEvents } from "./ikarOyvedManager/worker/WorkerErrorEvents.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { interceptWorkerMessage } from "./ikarOyvedManager/messages/WorkerMessageInterceptor.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { WorkerQueue } from "./ikarOyvedManager/queue/WorkerQueue.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { WorkerRuntimeState } from "./ikarOyvedManager/state/WorkerRuntimeState.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { oyvedManagerLog } from "./ikarOyvedManager/log/MainTextLogger.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { startWorkerProgressWatchdog } from "./ikarOyvedManager/watch/WorkerProgressWatchdog.js?v=wide-platform-real-boot-chain-20260529-bh75";

export default class OlamWorkerManager {
  /** @param {string} workerPath Worker URL. @param {object} options Hooks. @param {HTMLCanvasElement} canvasElement Canvas. @param {object} ui UI. */
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

  get opened() { return this.runtime.opened; }
  set opened(value) { this.runtime.opened = Boolean(value); }

  async _dispatchPawsawch() {
    if (this.runtime.pawsawchDispatched || this._pawsawchDispatched) return;
    this.runtime.pawsawchDispatched = true;
    this.runtime.opened = true;
    this._pawsawchDispatched = true;
    this.opened = true;
    this.processQueue();
    try {
      if (typeof this.customTawfeekeem.pawsawch === "function") await this.customTawfeekeem.pawsawch();
    } catch (error) {
      oyvedManagerLog.error("pawsawch dispatch failed", { message: error?.message || String(error), stack: String(error?.stack || "no stack").replace(/\s+/g, " ") });
    }
  }

  postMessage(data, transfer = []) {
    let dayuh = data;
    try {
      if (dayuh && typeof dayuh === "object") dayuh = Utils.stringifyFunctions(data);
      const action = () => this.eved.postMessage(dayuh, transfer.length > 0 ? transfer : undefined);
      if (!this.runtime.opened) return void this.queue.add(action);
      action();
    } catch (error) {
      oyvedManagerLog.error("Worker postMessage failed", { message: error?.message || String(error), stack: String(error?.stack || "no stack").replace(/\s+/g, " ") });
    }
  }

  processQueue() {
    try { this.queue.flush(); }
    catch (error) { oyvedManagerLog.error("Worker queue flush failed", { message: error?.message || String(error), stack: String(error?.stack || "no stack").replace(/\s+/g, " ") }); }
  }

  _initStagnationWatch() {
    const check = () => {
      const silence = this.runtime.silenceMs();
      if ((this.runtime.vesselIsReady || this._vesselIsReady) && silence > 25000 && !this.runtime.worldLoaded && !this._worldLoaded) {
        oyvedManagerLog.error("Worker silent after vessel ready", { seconds: Math.floor(silence / 1000), workerPath: this.workerPath });
      }
      setTimeout(check, 5000);
    };
    setTimeout(check, 10000);
  }
}
