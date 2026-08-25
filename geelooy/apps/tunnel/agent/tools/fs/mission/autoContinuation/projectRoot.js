// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Authority = require("../projectRootAuthority.js");
const Registry = require("../projectRootRegistry.js");

/**
 * @file Resolves continuation work onto living project authority instead of historical address.
 * @description
 * The Awtsmoos carries one mission through changing folders; Awtsmoos.com trusts a current
 * same-mission binding first, keeps a still-precise historical repository as fallback, and lets
 * broad or vanished roots yield to living cwd or unambiguous discovery without blind guessing.
 */
function resolve(config = {}, mission = {}, lock = {}, binding = null) {
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
	return Authority.resolve(config, current, historical).root;
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

module.exports = { resolve, sameMission, scope };
