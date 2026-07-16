// B"H
// Boruch Hashem
// Blessed is He

/** @module DerivedSupport @description Recursive evidence helpers for allowlisted cleanup. */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function recursiveTargets(target) {
	if (!fs.existsSync(target)) return [];
	const status = fs.statSync(target);
	if (!status.isDirectory()) return [target];
	const output = [target];
	for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
		const child = path.join(target, entry.name);
		if (entry.isDirectory()) output.push(...recursiveTargets(child));
		else output.push(child);
	}
	return output;
}

function allocatedBytes(target) {
	try {
		const output = execFileSync('/usr/bin/du', ['-sk', target], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe']
		});
		return Number(output.trim().split(/\s+/)[0]) * 1024;
	} catch {
		return 0;
	}
}

function readJson(file) {
	try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

module.exports = {
	allocatedBytes,
	readJson,
	recursiveTargets
};