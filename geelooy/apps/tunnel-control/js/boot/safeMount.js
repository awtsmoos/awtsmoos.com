
// B"H

import { log, error } from "../logger.js";

/**
 * B"H
 * Mounts one feature without letting one fracture break the palace.
 *
 * @param {string} name Feature name.
 * @param {Function} fn Mount function.
 * @returns {Promise<void>} Resolves after attempt.
 */
export async function safeMount(name, fn) {
  try {
    log("mounting", name);
    await fn();
    log("mounted", name);
  } catch (e) {
    error("mount failed:", name, e);
  }
}
