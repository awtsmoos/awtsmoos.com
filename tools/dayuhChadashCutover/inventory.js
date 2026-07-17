// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverInventory
 * @description
 * The Awtsmoos orders nested vessels before parents, sending the compiler lab
 * to quarantine before lean AI moves into the active runtime root.
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
		policy.embedderLabSource,
		policy.aiSource,
		policy.rawSocialSource,
		...derivedPackedEntries(policy)
	]).sort(deepestFirst);
	const moves = sources
		.map(source => moveRecord(policy, source, destinationFor(policy, source)))
		.filter(Boolean);
	return {
		format: 'awtsmoos-final-cutover-inventory-v2',
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

function deepestFirst(left, right) {
	const difference = right.split(path.sep).length - left.split(path.sep).length;
	return difference || left.localeCompare(right);
}

function unique(values) {
	return [...new Set(values.filter(Boolean))];
}

function cutoverError(message) {
	return Object.assign(new Error(`B"H cutover refused: ${message}`), {
		code: 'AWTSMOOS_CUTOVER_REFUSED'
	});
}

module.exports = {
	buildInventory,
	cutoverError,
	deepestFirst,
	derivedPackedEntries,
	evidence,
	moveRecord,
	nearestExistingParent,
	unique
};
