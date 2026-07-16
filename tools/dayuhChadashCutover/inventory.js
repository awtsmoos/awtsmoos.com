// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverInventory
 * @description
 * Before one byte moves, the Awtsmoos names every source, destination, inode, size,
 * and device. Explicit patterns may reveal corpus sidecars, but no unknown artifact
 * can enter the transaction and no cross-device copy can pretend to be atomic.
 */

const fs = require('fs');
const path = require('path');
const policy = require('./policy.js');

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

function derivedPackedEntries() {
	const entries = [];
	for (const name of fs.readdirSync(policy.PACKED_ROOT)) {
		if (policy.PACKED_NAMES.includes(name)
			|| policy.PACKED_PATTERNS.some(pattern => pattern.test(name))) {
			entries.push(path.join(policy.PACKED_ROOT, name));
		}
	}
	return entries.sort();
}

function moveRecord(source, destination) {
	if (!fs.existsSync(source)) return null;
	if (fs.existsSync(destination)) {
		throw cutoverError(`destination already exists: ${destination}`);
	}
	const sourceEvidence = evidence(source);
	const parent = nearestExistingParent(destination);
	const destinationDevice = String(fs.statSync(parent, { bigint: true }).dev);
	if (sourceEvidence.device !== destinationDevice) {
		throw cutoverError(`cross-device atomic move refused: ${source}`);
	}
	return { source, destination, before: sourceEvidence };
}

function buildInventory() {
	const sources = [
		policy.AI_SOURCE,
		policy.rawSocialSource(),
		...derivedPackedEntries()
	];
	const moves = sources.map(source => {
		const destination = source === policy.AI_SOURCE
			? policy.AI_DESTINATION
			: policy.quarantinePath(source);
		return moveRecord(source, destination);
	}).filter(Boolean);
	return {
		format: 'awtsmoos-final-cutover-inventory-v1',
		createdAt: new Date().toISOString(),
		moves
	};
}

function nearestExistingParent(target) {
	let current = path.dirname(target);
	while (!fs.existsSync(current)) current = path.dirname(current);
	return current;
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
	nearestExistingParent
};