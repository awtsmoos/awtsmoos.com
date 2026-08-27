// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Authority = require("../projectRootAuthority.js");
const Registry = require("../projectRootRegistry.js");

/**
 * @file Resolves continuation onto living project authority and exposes its proof witness.
 * @description
 * The Awtsmoos carries one mission through changing folders; Awtsmoos.com now preserves
 * not only the chosen root but whether that root was precisely witnessed, so a fresh chat
 * may receive today's absolute road without granting authority to yesterday's dead address.
 */
function witness(config = {}, mission = {}, lock = {}, binding = null) {
	const missionId = String(mission.id || mission.missionId || lock.missionId || "");
	const active = Registry.read(config);
	const current = [
		sameMission(binding, missionId)?.projectRoot,
		sameMission(active, missionId)?.projectRoot
	];
	const historical = [
		lock.projectRoot,
		mission.metadata?.projectRoot,
		mission.projectRoot,
		mission.room?.projectRoot
	];
	return Authority.resolve(config, current, historical);
}

function resolve(config = {}, mission = {}, lock = {}, binding = null) {
	return witness(config, mission, lock, binding).root;
}

function scope(config = {}, projectRoot = "") {
	return {
		...config,
		root: path.resolve(projectRoot || config.root || process.cwd())
	};
}

function sameMission(binding, missionId) {
	if (!binding?.projectRoot) return null;
	if (!binding.missionId || !missionId) return binding;
	return String(binding.missionId) === missionId ? binding : null;
}

module.exports = {
	resolve,
	sameMission,
	scope,
	witness
};
