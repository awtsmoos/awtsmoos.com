// B"H

const ORDER = ["routing", "compute", "storage", "gpu"];

const WORLDS = Object.freeze({
  routing: world("routing", "Chessed", "חסד", "Routing World", "Movement, tunnels, relays, API paths", "gold"),
  compute: world("compute", "Gevurah", "גבורה", "Compute World", "CPU, command runtime, agent effort", "violet"),
  storage: world("storage", "Tiferes", "תפארת", "Storage World", "Files, memory, blobs, artifacts", "green"),
  gpu: world("gpu", "Netzach", "נצח", "GPU World", "Images, models, acceleration, luminous creation", "blue")
});

/**
 * B"H
 * Chapter 611: Four coins stood around the treasury gate.
 * They did not erase the accounting names; they clothed them in worlds.
 */
function world(key, name, hebrew, title, description, tone) {
  return { key, name, hebrew, title, description, tone };
}
function allWorlds() { return ORDER.map(key => WORLDS[key]); }
function worldFor(key) { return WORLDS[key] || WORLDS.routing; }
function decorateBalances(balances = {}) {
  return allWorlds().map(item => ({ ...item, balance: Number(balances[item.key] || 0) }));
}
function zeroWorldTotals() { return Object.fromEntries(ORDER.map(key => [key, 0])); }
function normalizeWorldTotals(value = {}) { return Object.fromEntries(ORDER.map(key => [key, Number(value[key] || 0)])); }
module.exports = { ORDER, WORLDS, allWorlds, decorateBalances, normalizeWorldTotals, worldFor, zeroWorldTotals };
