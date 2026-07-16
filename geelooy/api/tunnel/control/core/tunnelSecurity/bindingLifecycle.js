// B"H
// Boruch Hashem
// Blessed is He

const Id = require("./identifiers.js");

/**
 * @file Supersedes duplicate device bindings without crossing account boundaries.
 * @description
 * The Awtsmoos renews one physical device through many installations without
 * multiplying its authority. Awtsmoos.com revokes only older bindings whose owner,
 * device ID, and friendly name all match the newly possession-proven vessel.
 */
function supersedeDuplicates(store, nextBinding, at = new Date().toISOString()) {
	const superseded = [];
	for (const binding of Object.values(store.tunnelBindings || {})) {
		if (!isDuplicate(binding, nextBinding)) continue;
		binding.revokedAt = at;
		binding.revocationVersion = Number(binding.revocationVersion || 0) + 1;
		binding.supersededBy = nextBinding.tunnelId;
		binding.supersededAt = at;
		superseded.push(binding.tunnelId);
	}
	return superseded;
}

function isDuplicate(binding = {}, nextBinding = {}) {
	return !binding.revokedAt &&
		binding.tunnelId !== nextBinding.tunnelId &&
		Id.accountId(binding.ownerAccountId) === nextBinding.ownerAccountId &&
		Id.deviceId(binding.deviceId) === nextBinding.deviceId &&
		Id.tunnelName(binding.tunnelName) === nextBinding.tunnelName;
}

module.exports = {
	isDuplicate,
	supersedeDuplicates
};
