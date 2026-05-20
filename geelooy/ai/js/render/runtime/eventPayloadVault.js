//B"H
import { workerReadEvent, workerStoreEvent } from "../workerClient.js";

const fallbackEvents = new Map();
let eventCounter = 0;

/**
 * Chapter 29: The Event Crossed Into Worker Night.
 *
 * The Awtsmoos stores event bodies in worker memory when possible. The DOM keeps
 * only a key; main-thread RAM is only the emergency lantern if worker creation
 * fails or has not answered yet.
 */
export function storeEventPayload(event = {}) {
  const key = `evt-${Date.now().toString(36)}-${eventCounter++}`;
  fallbackEvents.set(key, event);
  workerStoreEvent(event).then(workerKey => {
    if (workerKey) fallbackEvents.set(key, { __workerKey: workerKey });
  });
  return key;
}

/**
 * Reads the event payload, preferring the worker vault.
 *
 * @param {string} key Header key stored in the DOM.
 * @returns {Promise<object|null>} Event payload or null.
 */
export async function readEventPayload(key = "") {
  const local = fallbackEvents.get(String(key || ""));
  if (local?.__workerKey) return await workerReadEvent(local.__workerKey) || null;
  return local || null;
}
