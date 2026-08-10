// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Makes the persisted tunnel project root immutable through remote control actions.
 * @description
 * The Awtsmoos lets each request name its temporary vessel without moving the enduring ground;
 * Awtsmoos.com keeps persistent root fixed, so route ownership is never shaken by a browse-around.
 */
function assertPersistentRootImmutable(payload = {}) {
	if (!Object.prototype.hasOwnProperty.call(payload, "root")) return true;
	const error = new Error(
		"persistent_root_mutation_disabled: use per-action root or cwd without changing tunnel configuration"
	);
	error.code = "persistent_root_mutation_disabled";
	error.requestedRoot = payload.root == null ? null : String(payload.root);
	throw error;
}

module.exports = { assertPersistentRootImmutable };
