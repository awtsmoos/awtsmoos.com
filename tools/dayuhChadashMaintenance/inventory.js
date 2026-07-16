// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashInventory
 * @description
 * The Awtsmoos weighs canonical data, external runtime assets, removable derived
 * work, and every FS3 family separately. A budget alarm therefore cannot masquerade
 * as a database-vacuum instruction, and every census remains bounded in time.
 */

const { allocatedBytes } = require('./allocation.js');
const { discoverDerived } = require('./derivedInventory.js');
const {
	familyInventory,
	fileEvidence,
	sidecarBytes
} = require('./familyInventory.js');

function familyInventories(policy, options = {}) {
	return Object.fromEntries(
		policy.families.map(family => [
			family,
			familyInventory(policy, family, options)
		])
	);
}

function fullInventory(policy, options = {}) {
	const timeoutMs = Number(options.timeoutMs || 120000);
	return {
		capturedAt: new Date().toISOString(),
		dataRoot: policy.dataRoot,
		allocatedBytes: allocatedBytes(policy.dataRoot, { timeoutMs }),
		aiRoot: policy.aiRoot,
		runtimeAssetBytes: allocatedBytes(policy.aiRoot, { timeoutMs }),
		derived: discoverDerived(policy, options),
		families: familyInventories(policy, options)
	};
}

module.exports = {
	allocatedBytes,
	familyInventories,
	familyInventory,
	fileEvidence,
	fullInventory,
	sidecarBytes
};