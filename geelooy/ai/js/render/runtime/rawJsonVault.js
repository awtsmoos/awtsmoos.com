//B"H
import { workerReadRaw, workerStoreRaw } from "../workerClient.js";

const fallbackRaw = new Map();
let rawJsonCounter = 0;

/**
 * Chapter 30: The Raw Scroll Left the Palace Wall.
 *
 * The Awtsmoos keeps raw JSON in worker memory where possible. The DOM receives
 * only a tiny key; main RAM remains a fallback bridge while the worker accepts
 * the scroll.
 *
 * @param {unknown} value Heavy raw payload.
 * @returns {string} Tiny lookup key.
 */
export function storeRawJson(value) {
  const key = `raw-${Date.now().toString(36)}-${rawJsonCounter++}`;
  fallbackRaw.set(key, safeJson(value));
  workerStoreRaw(value).then(workerKey => {
    if (workerKey) fallbackRaw.set(key, { __workerKey: workerKey });
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

function safeJson(value) {
  try { return JSON.stringify(value, null, 2); }
  catch { return String(value || ""); }
}
