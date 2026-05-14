
// B"H

const crypto = require("crypto");

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

async function saveCode(record) {
  return await createCode(record);
}

function takeCode(code) {
  cleanExpiredCodes();

  const record = store.get(code);

  if (!record) return null;

  store.delete(code);

  if (record.expiresAt <= now()) return null;

  return record;
}

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
