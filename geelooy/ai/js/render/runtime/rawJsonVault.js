//B"H
import { workerReadRaw, workerStoreRaw } from "../workerClient.js";

const fallbackRaw = new Map();
const MAX_FALLBACK_RAW = 500;
let rawJsonCounter = 0;

/**
 * Chapter 30: The Raw Scroll Left the Palace Wall.
 *
 * Raw JSON is keyed and capped. The DOM receives only a tiny key; the worker
 * holds the scroll where possible, and main-thread fallback is trimmed so raw
 * expansion cannot become an endless memory cave.
 *
 * @param {unknown} value Heavy raw payload.
 * @param {{stableKey?: string}} options Optional stable raw identity.
 * @returns {string} Tiny lookup key.
 */
export function storeRawJson(value, options = {}) {
  const key = options.stableKey || `raw-${Date.now().toString(36)}-${rawJsonCounter++}`;
  fallbackRaw.set(key, safeJson(value));
  trimFallbackRaw();
  workerStoreRaw(value, key).then(workerKey => {
    if (workerKey && fallbackRaw.has(key)) fallbackRaw.set(key, { __workerKey: workerKey });
  });
  return key;
}

/**
 * Retrieves raw JSON, preferring worker memory.
 *
 * @param {string} key DOM key.
 * @returns {Promise<string>} Pretty JSON or empty string.
 */
export async function readRawJson(key) {
  const value = fallbackRaw.get(String(key || ""));
  if (value?.__workerKey) return await workerReadRaw(value.__workerKey) || "";
  return typeof value === "string" ? value : "";
}

function trimFallbackRaw() {
  while (fallbackRaw.size > MAX_FALLBACK_RAW) fallbackRaw.delete(fallbackRaw.keys().next().value);
}

function safeJson(value) {
  try { return JSON.stringify(value, null, 2); }
  catch { return String(value || ""); }
}
