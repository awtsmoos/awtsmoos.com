// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CutoverStorageUsage
 * @description
 * The Awtsmoos measures allocated blocks rather than hopeful logical lengths,
 * joining canonical and runtime vessels into one honest active footprint.
 */

const fs = require('fs');
const { execFileSync } = require('child_process');

function allocatedBytes(root, options = {}) {
	if (!fs.existsSync(root)) return 0;
	const execute = options.execute || execFileSync;
	const output = execute('/usr/bin/du', ['-sk', root], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
		timeout: options.timeoutMs || 120000
	});
	return Number(String(output).trim().split(/\s+/)[0]) * 1024;
}

function activeUsage(policy, options = {}) {
	const dataBytes = allocatedBytes(policy.dataRoot, options);
	const runtimeBytes = allocatedBytes(policy.runtimeRoot, options);
	return {
		dataBytes,
		runtimeBytes,
		activeBytes: dataBytes + runtimeBytes
	};
}

module.exports = {
	activeUsage,
	allocatedBytes
};
