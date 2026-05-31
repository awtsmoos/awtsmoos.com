// B"H
/**
 * @file WorkerMessageFlow.js
 * @description
 * Chapter 89: after a new Olam is born inside the same worker, the remembered
 * canvas is reattached from within the worker itself. The main thread does not
 * transfer the white vessel twice; the Awtsmoos renews the world while the
 * worker flame remains one continuous breath.
 */
import { postPlainWorkerError } from "./PlainWorkerPost.js";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js";
import { setActiveOlamInstance } from "./WorkerBootState.js";
import { getWorkerMessageTypeText } from "./WorkerMessageGuard.js";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js";
import { reattachRememberedCanvas } from "../CanvasMemory.js";

/**
 * Reattaches the worker-owned canvas after genesis creates a fresh Olam.
 *
 * @param {Object} state
 * Worker state.
 *
 * @param {Object} olam
 * New active Olam instance.
 *
 * @param {string} typeText
 * Message label for progress logs.
 *
 * @returns {Promise<void>}
 */
async function bindRememberedCanvasAfterGenesis(state, olam, typeText) {
  setActiveOlamInstance(state, olam);
  postWorkerProgress(`message:${typeText}:stored-active-olam`);
  const reused = await reattachRememberedCanvas(olam);
  if (reused) postWorkerProgress(`message:${typeText}:remembered-canvas-reattached`);
}

/**
 * Handles one message event after worker boot.
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
    const responseType = await OyvedMessageInterpreter.handleMessage(data, ready, state.systemCore, state.promiseMap);
    postWorkerProgress(`message:${typeText}:handleMessage:done`);
    if (responseType !== null && typeof responseType === "object") {
      await bindRememberedCanvasAfterGenesis(state, responseType, typeText);
      return;
    }
    if (responseType === "CONTINUOUS") {
      postWorkerProgress(`message:${typeText}:handleOngoing:start`);
      await OyvedMessageInterpreter.handleOngoing(state.activeOlamInstance, data, state.promiseMap);
      postWorkerProgress(`message:${typeText}:handleOngoing:done`);
    }
  } catch (error) {
    const text = ["Worker message flow failed", `messageType=${typeText}`, plainWorkerErrorText(error)].join(" || ");
    postPlainWorkerError(text, false);
  }
}
