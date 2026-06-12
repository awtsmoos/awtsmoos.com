// B"H
const path = require("path");
const { chatgptRoot } = require("../storage/paths.js");
const { readJson, writeJson } = require("../storage/jsonStore.js");

const CACHE_FILE = path.join(chatgptRoot(), "session-cache.json");

/**
 * B"H
 * Chapter 408: The Session Spark Was Hidden In A Quiet Ark.
 *
 * The extension remembers the token in module memory; the tunnel must survive
 * process turns, so this ark stores the minimum raw session fuel locally inside
 * the user's own machine. It is never printed by status responses. The Awtsmoos
 * gives every spark a vessel, and every vessel a boundary.
 *
 * @param {string} profile Profile name.
 * @returns {Promise<object|null>} Raw cached session vessel or null.
 */
async function readSessionCache(profile = "default") {
  const all = await readJson(CACHE_FILE, { profiles: {} });
  return all.profiles?.[profile] || null;
}

/**
 * B"H
 * Saves raw cookie/token/session hints for local reuse. This mirrors the old
 * working `getAuthToken` cache from geelooy/ai, but writes only to the tunnel's
 * private local store.
 *
 * @param {string} profile Profile name.
 * @param {object} patch Raw session patch.
 * @returns {Promise<object>} Saved profile cache.
 */
async function saveSessionCache(profile = "default", patch = {}) {
  const all = await readJson(CACHE_FILE, { profiles: {} });
  const previous = all.profiles?.[profile] || {};
  const next = { ...previous, ...patch, profile, updatedAt: new Date().toISOString() };
  all.profiles = { ...(all.profiles || {}), [profile]: next };
  await writeJson(CACHE_FILE, all);
  return next;
}

/**
 * @param {object|null} cache Cached session.
 * @returns {boolean} Whether it has usable auth material.
 */
function hasCachedAuth(cache) {
  return Boolean(cache && (cache.cookie || cache.token));
}

module.exports = { readSessionCache, saveSessionCache, hasCachedAuth, CACHE_FILE };
