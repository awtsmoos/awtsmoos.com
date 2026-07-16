// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DerivedInventory
 * @description
 * The Awtsmoos distinguishes removable build vessels from canonical runtime assets.
 * This bounded top-level census lets the supervisor act on real cleanup work instead
 * of recycling merely because a broad storage budget is red.
 */

const fs = require('fs');
const path = require('path');
const {
	DERIVED_PATTERNS,
	PROTECTED_NAMES,
	activeNames
} = require('./cleanupDerived.js');

function isAllowedDerived(name, isDirectory) {
	if (isDirectory) {
		return DERIVED_PATTERNS.some(pattern => pattern.test(name));
	}
	return /(?:\.log|\.before_[^.]+\.js|rag-progress\.json|sidecars_.*\.txt)$/i
		.test(name);
}

function discoverDerived(policy, options = {}) {
	if (!fs.existsSync(policy.ragRoot)) {
		return { count: 0, bytes: 0, entries: [] };
	}
	const protectedNames = activeNames(policy.ragRoot);
	const now = Number(options.now ?? Date.now());
	const entries = [];
	for (const entry of fs.readdirSync(policy.ragRoot, { withFileTypes: true })) {
		if (protectedNames.has(entry.name)) continue;
		if (!isAllowedDerived(entry.name, entry.isDirectory())) continue;
		const target = path.join(policy.ragRoot, entry.name);
		const status = fs.statSync(target);
		if (now - status.mtimeMs < policy.minimumMaintenanceAgeMs) continue;
		entries.push({
			name: entry.name,
			path: target,
			allocatedBytes: Number(status.blocks || 0) * 512,
			mtimeMs: Number(status.mtimeMs)
		});
	}
	return {
		count: entries.length,
		bytes: entries.reduce(
			(total, entry) => total + entry.allocatedBytes,
			0
		),
		entries
	};
}

module.exports = {
	discoverDerived,
	isAllowedDerived
};