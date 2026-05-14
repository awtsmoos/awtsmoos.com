
// B"H

const crypto = require("crypto");

const codeStore = new Map();
const CODE_TTL_MS = 10 * 60 * 1000;

/**
 * B"H
 * Creates a short-lived authorization code.
 *
 * This is memory-backed for the first working version.
 * Later, replace with DB persistence if you run multiple Node processes.
 *
 * @param {object} details Authorization code details.
 * @returns {Promise<string>} Authorization code.
 */
async function createCode(details) {
  const code = "awt_code_" + crypto.randomBytes(32).toString("base64url");

  codeStore.set(code, {
    ...details,
    code,
    used: false,
    createdAt: Date.now(),
    expiresAt: Date.now() + CODE_TTL_MS
  });

  return code;
}

/**
 * B"H
 * Reads an authorization code.
 *
 * @param {string} code Authorization code.
 * @returns {Promise<object|null>} Code record.
 */
async function readCode(code) {
  return codeStore.get(code) || null;
}

/**
 * B"H
 * Marks a code as consumed.
 *
 * @param {string} code Authorization code.
 * @returns {Promise<boolean>} True if consumed.
 */
async function consumeCode(code) {
  const rec = codeStore.get(code);
  if (!rec) return false;
  codeStore.set(code, { ...rec, used: true, usedAt: Date.now() });
  return true;
}

module.exports = { createCode, readCode, consumeCode };
