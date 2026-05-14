
// B"H
const crypto = require("crypto");

/**
 * B"H
 * Shared in-memory OAuth authorization-code store.
 *
 * This exports createCode/saveCode/takeCode to match all route versions.
 * It is in-memory, so /authorize and /token must run in the same Node process.
 */

const CODE_TTL_MS = 5 * 60 * 1000;

const store =
  global.__AWTSMOOS_OAUTH_CODE_STORE__ ||
  (global.__AWTSMOOS_OAUTH_CODE_STORE__ = new Map());

function now() {
  return Date.now();
}

function cleanExpiredCodes() {
  const t = now();

  for (const [code, record] of store.entries()) {
    if (!record || record.expiresAt <= t) {
      store.delete(code);
    }
  }
}

function makeCode() {
  return "awt_code_" + crypto.randomBytes(32).toString("base64url");
}

/**
 * B"H
 * Creates and stores an authorization code.
 *
 * @param {object} record Authorization code record.
 * @returns {Promise<string>} Code.
 */
async function createCode(record) {
  cleanExpiredCodes();

  const code = makeCode();

  store.set(code, {
    code,
    kind: "oauth_authorization_code",
    userId: record.userId,
    user: record.user || null,
    clientId: record.clientId,
    redirectUri: record.redirectUri,
    scope: record.scope,
    state: record.state || "",
    createdAt: now(),
    expiresAt: now() + CODE_TTL_MS
  });

  return code;
}

/**
 * B"H
 * Alias for older route versions.
 *
 * @param {object} record Authorization code record.
 * @returns {Promise<string>} Code.
 */
async function saveCode(record) {
  return await createCode(record);
}

/**
 * B"H
 * Reads and deletes a code.
 *
 * @param {string} code Code.
 * @returns {object|null}
 */
function takeCode(code) {
  cleanExpiredCodes();

  const record = store.get(code);

  if (!record) return null;

  store.delete(code);

  if (record.expiresAt <= now()) return null;

  return record;
}

/**
 * B"H
 * Reads without deleting. Debug helper.
 *
 * @param {string} code Code.
 * @returns {object|null}
 */
function peekCode(code) {
  cleanExpiredCodes();
  return store.get(code) || null;
}

module.exports = {
  createCode,
  saveCode,
  takeCode,
  peekCode,
  cleanExpiredCodes
};
