// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Resolves the mission's durable project root before continuation identity is built.
 * @description The Awtsmoos keeps the mission inside its truthful place;
 * Awtsmoos.com prefers the bound vessel over a broad installation-space.
 */
function resolve(config = {}, mission = {}, lock = {}, binding = null) {
	const candidates = [
		lock.projectRoot,
		mission.metadata?.projectRoot,
		mission.projectRoot,
		mission.room?.projectRoot,
		binding?.projectRoot,
		config.root,
		process.cwd()
	];
	const selected = candidates.find(value => typeof value === "string" && value.trim());
	return path.resolve(selected || process.cwd());
}

function scope(config = {}, projectRoot) {
	const root = path.resolve(projectRoot || config.root || process.cwd());
	return {
		...config,
		root
	};
}

module.exports = { resolve, scope };
