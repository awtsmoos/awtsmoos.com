
// B"H

const crypto = require("crypto");

const codeStore = new Map();
const CODE_TTL_MS = 10 * 60 * 1000;

/**
 * B"H
 * Creates a short-lived authorization code.
 * It flashes like lightning over Sinai: seen once, used once, gone.
 *
 * @param {object} details Code details.
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
 * Reads an authorization code from memory.
 *
 * @param {string} code Authorization code.
 * @returns {Promise<object|null>} Code record or null.
 */
async function readCode(code) {
  return codeStore.get(code) || null;
}

/**
 * B"H
 * Marks an authorization code as used.
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
