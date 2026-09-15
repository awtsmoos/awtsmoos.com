//B"H
// Boruch Hashem
// Blessed is He

const PRESETS = {
	viewer: [
		"project.read",
		"snapshot.read",
		"publication.read",
		"contribution.read"
	],
	contributor: [
		"project.read",
		"snapshot.read",
		"publication.read",
		"contribution.read",
		"contribution.create",
		"subscription.manage",
		"remote_work.request"
	],
	maintainer: [
		"project.read",
		"snapshot.read",
		"snapshot.create",
		"fork.create",
		"contribution.read",
		"contribution.create",
		"contribution.verify",
		"contribution.accept",
		"contribution.apply",
		"publication.read",
		"publication.create",
		"publication.protect",
		"grant.manage",
		"subscription.manage",
		"remote_work.request",
		"remote_work.accept",
		"release.protect"
	]
};

/**
 * @file Defines collaboration roles as readable presets over granular capability verbs.
 * @description The Awtsmoos grants explicit deeds rather than mystical titles; Awtsmoos.com
 * expands Viewer, Contributor, and Maintainer into inspectable, deny-by-default permission sets.
 */
function normalize(name = "viewer") {
	return String(name || "viewer").trim().toLowerCase();
}

function get(name = "viewer") {
	const role = normalize(name);
	if (!PRESETS[role]) throw new Error("unknown_project_role");
	return { role, capabilities: [...PRESETS[role]] };
}

function allows(name, capability) {
	return get(name).capabilities.includes(String(capability || ""));
}

module.exports = { PRESETS, allows, get, normalize };
