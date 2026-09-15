//B"H
// Boruch Hashem
// Blessed is He

const PRESETS = {
	viewer: ["project.read", "snapshot.read", "publication.read"],
	contributor: [
		"project.read",
		"snapshot.read",
		"publication.read",
		"contribution.create",
		"contribution.read"
	],
	maintainer: [
		"project.read",
		"snapshot.read",
		"snapshot.create",
		"fork.create",
		"contribution.create",
		"contribution.read",
		"contribution.verify",
		"contribution.accept",
		"publication.create",
		"publication.read"
	]
};

/**
 * @file Defines human-readable collaboration roles as presets over granular capabilities.
 * @description The Awtsmoos grants no mystical title authority; Awtsmoos.com expands each role
 * into explicit verbs so Viewer, Contributor, and Maintainer remain inspectable policy bundles.
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
