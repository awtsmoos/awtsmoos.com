//B"H
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");
const PROJECT = path.resolve(ROOT, "../..");

/**
 * B"H — Tiny assertions for the AI cockpit verification harness.
 * They keep every test small, explicit, and readable from Termux or desktop.
 */
function assert(condition, message, facts = {}) {
  if (!condition) {
    const error = new Error(message);
    error.facts = facts;
    throw error;
  }
}

async function test(name, fn) {
  const started = Date.now();
  try {
    const facts = await fn();
    return { ok: true, name, ms: Date.now() - started, facts: facts || {} };
  } catch (error) {
    return { ok: false, name, ms: Date.now() - started, error: error.stack || String(error), facts: error.facts || {} };
  }
}

function makeStorage(seed = "") {
  return {
    value: seed,
    getItem() { return this.value || null; },
    setItem(key, value) { this.value = value; },
    removeItem() { this.value = ""; }
  };
}

module.exports = { ROOT, PROJECT, assert, test, makeStorage };
