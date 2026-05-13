
/**
 * B"H
 * @file WorkerMessageFlow.js
 * @description
 * Routes messages after Worker boot.
 */

import { postPlainWorkerText, postPlainWorkerError } from "./PlainWorkerPost.js";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js";
import { setActiveOlamInstance } from "./WorkerBootState.js";
import { getWorkerMessageTypeText } from "./WorkerMessageGuard.js";

/**
 * B"H
 * Handles one message event.
 *
 * @param {Object} state
 * Worker state.
 *
 * @param {any} data
 * Event data.
 *
 * @param {any} OyvedMessageInterpreter
 * Interpreter class.
 *
 * @returns {Promise<void>}
 */
export async function handleWorkerMessageFlow(state, data, OyvedMessageInterpreter) {
  const typeText = getWorkerMessageTypeText(data);

  try {
    postPlainWorkerText("worker_text_log", `Worker received message || type=${typeText}`);

    const ready = await state.bootPromise;

    const responseType = await OyvedMessageInterpreter.handleMessage(
      data,
      ready,
      state.systemCore,
      state.promiseMap
    );

    if (responseType !== null && typeof responseType === "object") {
      setActiveOlamInstance(state, responseType);
      postPlainWorkerText("worker_text_log", "Worker stored active Olam instance");
      return;
    }

    if (responseType === "CONTINUOUS") {
      OyvedMessageInterpreter.handleOngoing(
        state.activeOlamInstance,
        data,
        state.promiseMap
      );
    }
  } catch (error) {
    const text = [
      "Worker message flow failed",
      `messageType=${typeText}`,
      plainWorkerErrorText(error)
    ].join(" || ");

    postPlainWorkerError(text, false);
  }
}
