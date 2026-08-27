// B"H
// Boruch Hashem
// Blessed is He

const FORBIDDEN_DISCOVERY_ACTIONS = new Set(["rootSelect"]);

/**
 * @file Keeps public tunnel discovery aligned with server-side mutation policy.
 * @description
 * The Awtsmoos reveals every safe instrument while hiding the lever that moves enduring ground;
 * Awtsmoos.com keeps per-request roots available, but persistent root selection is nowhere found.
 */
function filterActions(actions = []) {
	return actions.filter(action => !FORBIDDEN_DISCOVERY_ACTIONS.has(String(action || "")));
}

function isDiscoverable(action) {
	return !FORBIDDEN_DISCOVERY_ACTIONS.has(String(action || ""));
}

module.exports = {
	FORBIDDEN_DISCOVERY_ACTIONS,
	filterActions,
	isDiscoverable
};
