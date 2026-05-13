
/**
 * B"H
 * @file WorkerMessageFlow.js
 * @description
 * Routes messages after Worker boot with progress checkpoints.
 */

import { postPlainWorkerError } from "./PlainWorkerPost.js";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js";
import { setActiveOlamInstance } from "./WorkerBootState.js";
import { getWorkerMessageTypeText } from "./WorkerMessageGuard.js";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js";

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
    postWorkerProgress(`message:${typeText}:received`);

    postWorkerProgress(`message:${typeText}:await-boot:start`);
    const ready = await state.bootPromise;
    postWorkerProgress(`message:${typeText}:await-boot:done:ready=${ready}`);

    postWorkerProgress(`message:${typeText}:handleMessage:start`);
    const responseType = await OyvedMessageInterpreter.handleMessage(
      data,
      ready,
      state.systemCore,
      state.promiseMap
    );
    postWorkerProgress(`message:${typeText}:handleMessage:done`);

    if (responseType !== null && typeof responseType === "object") {
      setActiveOlamInstance(state, responseType);
      postWorkerProgress(`message:${typeText}:stored-active-olam`);
      return;
    }

    if (responseType === "CONTINUOUS") {
      postWorkerProgress(`message:${typeText}:handleOngoing:start`);
      OyvedMessageInterpreter.handleOngoing(
        state.activeOlamInstance,
        data,
        state.promiseMap
      );
      postWorkerProgress(`message:${typeText}:handleOngoing:done`);
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
