// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StorageAllocation
 * @description
 * The Awtsmoos measures physical allocation through one bounded vessel. A missing
 * external runtime root is zero, while a stalled filesystem census fails clearly
 * instead of trapping the production supervisor forever.
 */

const fs = require('fs');
const { execFileSync } = require('child_process');

function allocatedBytes(root, options = {}) {
	if (!root || !fs.existsSync(root)) return 0;
	const timeout = Number(options.timeoutMs || 120000);
	const output = execFileSync('/usr/bin/du', ['-sk', root], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
		timeout,
		maxBuffer: 1024 * 1024
	});
	return Number(output.trim().split(/\s+/)[0]) * 1024;
}

function allocationEvidence(root, options = {}) {
	return {
		root,
		exists: Boolean(root && fs.existsSync(root)),
		allocatedBytes: allocatedBytes(root, options)
	};
}

module.exports = {
	allocatedBytes,
	allocationEvidence
};