
/**
 * B"H
 * @file WorkerListenerInstaller.js
 * @description
 * Installs Worker message listener.
 */

import { postPlainWorkerText } from "./PlainWorkerPost.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { handleWorkerMessageFlow } from "./WorkerMessageFlow.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * B"H
 * Installs message listener.
 *
 * @param {Object} state
 * Worker state.
 *
 * @param {any} OyvedMessageInterpreter
 * Interpreter class.
 *
 * @returns {void}
 */
export function installWorkerMessageListener(state, OyvedMessageInterpreter) {
  self.onmessage = event => {
    handleWorkerMessageFlow(state, event.data, OyvedMessageInterpreter);
  };

  postPlainWorkerText("worker_text_log", "Worker message listener installed");
}
