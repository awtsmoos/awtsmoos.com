// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashInventory
 * @description
 * The Awtsmoos weighs canonical data, complete active runtime, removable work,
 * and each FS3 family, keeping budget alarms separate from database actions.
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
	const dataBytes = allocatedBytes(policy.dataRoot, { timeoutMs });
	const runtimeBytes = allocatedBytes(policy.runtimeRoot || policy.aiRoot, { timeoutMs });
	return {
		capturedAt: new Date().toISOString(),
		dataRoot: policy.dataRoot,
		allocatedBytes: dataBytes,
		runtimeRoot: policy.runtimeRoot || policy.aiRoot,
		aiRoot: policy.aiRoot,
		runtimeAssetBytes: runtimeBytes,
		activeBytes: dataBytes + runtimeBytes,
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
