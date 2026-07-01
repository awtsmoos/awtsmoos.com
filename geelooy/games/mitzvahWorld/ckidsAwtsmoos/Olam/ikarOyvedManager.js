// B"H
/**
 * @file ikarOyvedManager.js
 * @purpose Own the live module worker and its lifecycle queue.
 * @owner mitzvahWorld main thread.
 * @inputs worker URL, startup callbacks, canvas, optional UI vessel.
 * @outputs worker posts, queue flushing, runtime readiness marks.
 * @runtimeAuthority This manager dispatches pawsawch only after vessel_ready.
 * @updateOrder construct worker -> bind events -> intercept messages -> queue posts.
 * @callers world manager startup flow.
 * @invariants one active manager is exposed on window for diagnostics.
 * @failureModes worker post/queue failures are logged through OYVED_MANAGER.
 */
import Utils from "../utils.js";
import UI from "/scripts/awtsmoos/ui/index.js";
import setupDomEvents from "./worker/domEvents.js?v=android-dom-events-20260612-bh2";
import setupMessageHandler from "./worker/messageHandler.js?v=zone-reality-20260614-bh817";
import { createModuleWorker } from "./ikarOyvedManager/worker/WorkerCreator.js";
import { attachWorkerErrorEvents } from "./ikarOyvedManager/worker/WorkerErrorEvents.js";
import { interceptWorkerMessage } from "./ikarOyvedManager/messages/WorkerMessageInterceptor.js?v=real-final-ready-20260701-bh2";
import { WorkerQueue } from "./ikarOyvedManager/queue/WorkerQueue.js";
import { WorkerRuntimeState } from "./ikarOyvedManager/state/WorkerRuntimeState.js";
import { oyvedManagerLog } from "./ikarOyvedManager/log/MainTextLogger.js";
import { startWorkerProgressWatchdog } from "./ikarOyvedManager/watch/WorkerProgressWatchdog.js";
const SEAL = "worker-truth-20260701-bh2";
function compactError(error) { return { message:error?.message || String(error), stack:String(error?.stack || "no stack").replace(/\s+/g, " ") }; }
export default class OlamWorkerManager {
  constructor(workerPath, options = {}, canvasElement, ui) {
    this.workerPath = workerPath; this.customTawfeekeem = options; this.canvasElement = canvasElement;
    this.myUi = ui || new UI(); this.queue = new WorkerQueue(); this.runtime = new WorkerRuntimeState();
    this._vesselIsReady = false; this._pawsawchDispatched = false; this._worldLoaded = false; this._canvasTransferred = false;
    window.ui = this.myUi; window.__AWTSMOOS_ACTIVE_WORKER_MANAGER__ = this;
    this.eved = createModuleWorker(workerPath); attachWorkerErrorEvents(this.eved, workerPath); setupMessageHandler(this); setupDomEvents(this);
    if (window.__AWTSMOOS_WORKER_TRACE__ === true) console.info('B"H | OYVED_MANAGER_BOUND', { seal:SEAL, workerPath, touchTrace:window.__AWTSMOOS_TOUCH_TRACE__?.slice?.(-4) || [] });
    this.eved.onmessage = event => { this.runtime.touch(); interceptWorkerMessage(this, event); this.handleMessageEvent(event); };
    this._initStagnationWatch(); startWorkerProgressWatchdog(this);
  }
  get opened() { return this.runtime.opened; }
  set opened(value) { this.runtime.opened = Boolean(value); }
  async _dispatchPawsawch() {
    if (this.runtime.pawsawchDispatched || this._pawsawchDispatched) return;
    this.runtime.pawsawchDispatched = true; this.runtime.opened = true; this._pawsawchDispatched = true; this.opened = true; this.processQueue();
    try { if (typeof this.customTawfeekeem.pawsawch === "function") await this.customTawfeekeem.pawsawch(); }
    catch (error) { oyvedManagerLog.error("pawsawch dispatch failed", compactError(error)); }
  }
  postMessage(data, transfer = []) {
    try { const dayuh = data && typeof data === "object" ? Utils.stringifyFunctions(data) : data; const action = () => this.eved.postMessage(dayuh, transfer.length > 0 ? transfer : undefined); if (!this.runtime.opened) return void this.queue.add(action); action(); }
    catch (error) { oyvedManagerLog.error("Worker postMessage failed", compactError(error)); }
  }
  processQueue() { try { this.queue.flush(); } catch (error) { oyvedManagerLog.error("Worker queue flush failed", compactError(error)); } }
  _initStagnationWatch() {
    const check = () => { const silence = this.runtime.silenceMs(); if ((this.runtime.vesselIsReady || this._vesselIsReady) && silence > 90000 && !this.runtime.worldLoaded && !this._worldLoaded) oyvedManagerLog.error("Worker silent after vessel ready", { seconds:Math.floor(silence / 1000), workerPath:this.workerPath }); setTimeout(check, 5000); };
    setTimeout(check, 10000);
  }
}
