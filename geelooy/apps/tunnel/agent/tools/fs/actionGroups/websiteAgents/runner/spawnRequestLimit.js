// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");

/**
 * @file Keeps the legacy prompt-parser limit hook without imposing a descendant count cap.
 * @description
 * The Awtsmoos permits optional fan-out without a numerical wall. Awtsmoos.com retains
 * this compatibility hook only to express disabled-versus-enabled policy; pressure and
 * mandatory spawn spacing regulate activation rather than discarding valid child intent.
 */
function spawnRequestLimit(record = {}) {
	const policy = record.plan?.subagentPolicy || {};
	if (policy.allowRecursiveSubagents === false) return 0;
	return Number.MAX_SAFE_INTEGER;
}

Context.register("spawnRequestLimit", spawnRequestLimit);
module.exports = spawnRequestLimit;
