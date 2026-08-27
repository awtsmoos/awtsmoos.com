
// B"H

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * B"H
 * Persistent OAuth refresh token store.
 *
 * This is intentionally tiny and file-backed for now. Later it can move into
 * AwtsmoosDB. The server stores only a hash of the refresh token.
 */

function dataDir() {
  return path.join(process.env.__awtsdir || process.cwd(), "geelooy", ".data");
}

function storePath() {
  return path.join(dataDir(), "oauth-refresh-tokens.json");
}

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(storePath(), "utf8"));
  } catch (e) {
    return { tokens: {} };
  }
}

function writeStore(store) {
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.writeFileSync(storePath(), JSON.stringify(store, null, 2), "utf8");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function makeRefreshToken() {
  return "awt_refresh_" + crypto.randomBytes(48).toString("base64url");
}

function createRefreshRecord(details) {
  const token = makeRefreshToken();
  const hash = hashToken(token);
  const now = Date.now();

  const store = readStore();

  store.tokens[hash] = {
    hash,
    userId: details.userId,
    clientId: details.clientId,
    scope: details.scope,
    createdAt: now,
    lastUsedAt: null,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000,
    revoked: false
  };

  writeStore(store);

  return token;
}

function readRefreshRecord(token) {
  const hash = hashToken(token);
  const store = readStore();
  return store.tokens[hash] || null;
}

function touchRefreshRecord(token) {
  const hash = hashToken(token);
  const store = readStore();

  if (!store.tokens[hash]) {
    return false;
  }

  store.tokens[hash].lastUsedAt = Date.now();
  writeStore(store);
  return true;
}

function revokeRefreshToken(token) {
  const hash = hashToken(token);
  const store = readStore();

  if (!store.tokens[hash]) {
    return false;
  }

  store.tokens[hash].revoked = true;
  store.tokens[hash].revokedAt = Date.now();
  writeStore(store);
  return true;
}

module.exports = {
  createRefreshRecord,
  readRefreshRecord,
  touchRefreshRecord,
  revokeRefreshToken
};
