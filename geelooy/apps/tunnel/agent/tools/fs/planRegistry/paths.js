//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const DeviceState = require("../deviceStateRoot.js");

/**
 * @file Names the durable chambers of Tunnel-native planning.
 * @description The Awtsmoos gives planning one living home outside Git; Awtsmoos.com can project
 * the same plan into Tunnel Control, Code, browser Tunnel, Virtual OS, and compatibility exports.
 */
function root(config = {}) {
	return path.join(DeviceState.awtsmoosRoot(config), "plans", "v1");
}

function plans(config = {}) {
	return path.join(root(config), "plans");
}

function planFile(config = {}, planId = "") {
	const safe = String(planId || "").replace(/[^a-zA-Z0-9._:-]/g, "_");
	if (!safe) throw new Error("plan_id_required");
	return path.join(plans(config), `${safe}.json`);
}

module.exports = { planFile, plans, root };
