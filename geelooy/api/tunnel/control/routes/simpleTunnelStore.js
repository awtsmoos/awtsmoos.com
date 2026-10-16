// B"H
// Boruch Hashem
// Blessed is He
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const PENDING_TTL = 5 * 60_000;
const RESULT_TTL = 30 * 60_000;
const sleepCell = new Int32Array(new SharedArrayBuffer(4));

function location() {
  return process.env.AWTSMOOS_SIMPLE_TUNNEL_STORE || "/var/lib/awtsmoos/simple-tunnel-queue.json";
}
function read(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { pending: [], active: {}, results: {}, usedNonces: {} };
  }
}
function cleanup(store, now = Date.now()) {
  store.pending = (store.pending || []).filter(item => now - item.createdAt <= PENDING_TTL);
  for (const [id, item] of Object.entries(store.active || {})) {
    if (now - item.createdAt > RESULT_TTL) delete store.active[id];
  }
  for (const [id, item] of Object.entries(store.results || {})) {
    if (now - item.completedAt > RESULT_TTL) delete store.results[id];
  }
  for (const [nonce, expiry] of Object.entries(store.usedNonces || {})) {
    if (expiry < now) delete store.usedNonces[nonce];
  }
  return store;
}

/** Small, synchronous, cross-worker queue transaction with private atomic storage. */
function transaction(callback) {
  const file = location();
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const lock = `${file}.lock`;
  let owned = false;
  for (let i = 0; i < 80; i++) {
    try { fs.mkdirSync(lock, { mode: 0o700 }); owned = true; break; }
    catch (error) {
      if (error.code !== "EEXIST") throw error;
      try { if (Date.now() - fs.statSync(lock).mtimeMs > 30_000) fs.rmSync(lock, { recursive: true }); }
      catch (e) { if (e.code !== "ENOENT") throw e; }
      Atomics.wait(sleepCell, 0, 0, 25);
    }
  }
  if (!owned) throw new Error("simple_tunnel_store_busy");
  try {
    const store = cleanup(read(file));
    store.pending ||= [];
    store.active ||= {};
    store.results ||= {};
    store.usedNonces ||= {};
    const result = callback(store);
    const tmp = `${file}.${process.pid}.${crypto.randomBytes(6).toString("hex")}.tmp`;
    try {
      fs.writeFileSync(tmp, JSON.stringify(store), { mode: 0o600, flag: "wx" });
      fs.renameSync(tmp, file);
    } finally { try { fs.unlinkSync(tmp); } catch {} }
    return result;
  } finally { fs.rmdirSync(lock); }
}

module.exports = { cleanup, location, transaction, PENDING_TTL, RESULT_TTL };
