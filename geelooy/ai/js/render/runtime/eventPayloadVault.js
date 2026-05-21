//B"H
import { workerReadEvent, workerStoreEvent } from "../workerClient.js";

const fallbackEvents = new Map();
let eventCounter = 0;

/**
 * Chapter 78: The Vault Learned Stable Names.
 *
 * Streaming thought chambers must not receive a new vault key every heartbeat.
 * If a stable key is supplied, the same DOM panel continues reading the same
 * living payload identity while the Awtsmoos refreshes its contents from moment
 * to moment.
 *
 * @param {object} event Event payload to store.
 * @param {{stableKey?: string}} options Optional stable key identity.
 * @returns {string} Payload lookup key.
 */
export function storeEventPayload(event = {}, options = {}) {
  const key = options.stableKey || `evt-${Date.now().toString(36)}-${eventCounter++}`;
  fallbackEvents.set(key, event);
  workerStoreEvent(event).then(workerKey => {
    if (workerKey && fallbackEvents.has(key)) fallbackEvents.set(key, { __workerKey: workerKey });
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
