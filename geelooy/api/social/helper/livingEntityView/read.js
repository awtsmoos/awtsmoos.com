// B"H
/**
 * @module LivingEntityRead
 * @description
 * Chapter 3: The reader of hidden chambers does not tear walls down. It knocks
 * softly on each legacy path and returns either a vessel or a warning, so the
 * bridge can reveal truth without pretending every old palace has the same shape.
 */

async function read($i, path, fallback = null) {
  try {
    const value = await $i.db.get(path);
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

async function safeCall(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    return fallback;
  }
}

function warning(code, message, details = {}) {
  return { code, message, details };
}

module.exports = { read, safeCall, warning };
