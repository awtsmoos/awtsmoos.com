
// B"H
const crypto = require("crypto");

/**
 * B"H
 * Shared in-memory OAuth authorization-code store.
 *
 * This fixes the bug where /authorize creates a code but /token cannot find it.
 * In production this can later be moved to a persistent DB, but for now this
 * works as long as authorize and token run in the same Node process.
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

function saveCode(record) {
  cleanExpiredCodes();

  const code = makeCode();

  store.set(code, {
    code,
    kind: "oauth_authorization_code",
    userId: record.userId,
    clientId: record.clientId,
    redirectUri: record.redirectUri,
    scope: record.scope,
    createdAt: now(),
    expiresAt: now() + CODE_TTL_MS
  });

  return code;
}

function takeCode(code) {
  cleanExpiredCodes();

  const record = store.get(code);

  if (!record) {
    return null;
  }

  store.delete(code);

  if (record.expiresAt <= now()) {
    return null;
  }

  return record;
}

function peekCode(code) {
  cleanExpiredCodes();
  return store.get(code) || null;
}

module.exports = {
  saveCode,
  takeCode,
  peekCode,
  cleanExpiredCodes
};
