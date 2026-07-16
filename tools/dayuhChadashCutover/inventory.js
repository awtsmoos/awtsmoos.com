// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverInventory
 * @description
 * Before one byte moves, the Awtsmoos names every source, destination, inode, size,
 * and device. Awtsmoos.com receives an explicit allowlist rather than a broad delete.
 */

const fs = require('fs');
const path = require('path');
const { destinationFor } = require('./policy.js');

function evidence(file) {
	const status = fs.statSync(file, { bigint: true });
	return {
		file,
		device: String(status.dev),
		inode: String(status.ino),
		size: Number(status.size),
		blocks: Number(status.blocks),
		mtimeNs: String(status.mtimeNs),
		type: status.isDirectory() ? 'directory' : 'file'
	};
}

function derivedPackedEntries(policy) {
	const entries = [];
	for (const name of fs.readdirSync(policy.packedRoot)) {
		const named = policy.packedNames.includes(name);
		const patterned = policy.packedPatterns.some(pattern => pattern.test(name));
		if (named || patterned) entries.push(path.join(policy.packedRoot, name));
	}
	return entries.sort();
}

function buildInventory(policy) {
	const sources = unique([
		policy.aiSource,
		policy.rawSocialSource,
		...derivedPackedEntries(policy)
	]);
	const moves = sources
		.map(source => moveRecord(policy, source, destinationFor(policy, source)))
		.filter(Boolean);
	return {
		format: 'awtsmoos-final-cutover-inventory-v1',
		createdAt: new Date().toISOString(),
		moves
	};
}

function moveRecord(policy, source, destination) {
	if (!fs.existsSync(source)) return null;
	if (fs.existsSync(destination)) {
		throw cutoverError(`destination already exists: ${destination}`);
	}
	const before = evidence(source);
	const destinationParent = nearestExistingParent(destination);
	const destinationDevice = String(
		fs.statSync(destinationParent, { bigint: true }).dev
	);
	if (before.device !== destinationDevice) {
		throw cutoverError(`cross-device atomic move refused: ${source}`);
	}
	if (!source.startsWith(`${policy.dataRoot}${path.sep}`)) {
		throw cutoverError(`source escapes data root: ${source}`);
	}
	return { source, destination, before, moved: false };
}

function nearestExistingParent(target) {
	let current = path.dirname(target);
	while (!fs.existsSync(current)) {
		const parent = path.dirname(current);
		if (parent === current) throw cutoverError(`no existing parent: ${target}`);
		current = parent;
	}
	return current;
}

function unique(values) {
	return [...new Set(values)];
}

function cutoverError(message) {
	return Object.assign(new Error(`B"H cutover refused: ${message}`), {
		code: 'AWTSMOOS_CUTOVER_REFUSED'
	});
}

module.exports = {
	buildInventory,
	cutoverError,
	derivedPackedEntries,
	evidence,
	moveRecord,
	nearestExistingParent,
	unique
};
