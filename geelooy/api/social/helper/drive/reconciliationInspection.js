//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveReconciliationInspection
 * @description
 * The Awtsmoos compares every logical spark with its immutable byte-vessel.
 * Awtsmoos.com checks each unique object once while charging every logical file.
 */

const { statObject } = require('./objectRepository.js');
const { mapWithConcurrency } = require('./boundedConcurrency.js');

async function inspectDriveState(aliasId, state, $i = {}, options = {}) {
	const files = Object.values(state.entries || {}).filter(entry => entry.type === 'file');
	const expected = files.reduce((totals, entry) => {
		totals.storedBytes += safeSize(entry.size);
		totals.fileCount += 1;
		return totals;
	}, { storedBytes: 0, fileCount: 0 });
	const groups = groupObjectReferences(files);
	const checks = await mapWithConcurrency(
		groups,
		options.concurrency || 16,
		group => inspectObject(aliasId, group, $i)
	);
	const missingObjects = checks.filter(check => check.missing);
	const sizeMismatches = checks.filter(check => check.sizeMismatch);
	const invalidEntries = files.filter(entry => !/^[a-f0-9]{64}$/.test(String(entry.objectHash || '')))
		.map(entry => ({ path: entry.path, objectHash: entry.objectHash || null }));
	const physicalBytes = checks.reduce((total, check) => {
		return total + (check.actualBytes || 0);
	}, 0);
	return {
		healthy: !missingObjects.length && !sizeMismatches.length && !invalidEntries.length,
		expectedUsage: expected,
		observedUsage: {
			storedBytes: Number(state.usage?.storedBytes || 0),
			fileCount: Number(state.usage?.fileCount || 0)
		},
		delta: {
			storedBytes: expected.storedBytes - Number(state.usage?.storedBytes || 0),
			fileCount: expected.fileCount - Number(state.usage?.fileCount || 0)
		},
		logicalFilesChecked: files.length,
		uniqueObjectsChecked: groups.length,
		physicalBytes,
		missingObjects,
		sizeMismatches,
		invalidEntries
	};
}

function groupObjectReferences(files) {
	const groups = new Map();
	for (const entry of files) {
		const hash = String(entry.objectHash || '');
		if (!/^[a-f0-9]{64}$/.test(hash)) continue;
		const group = groups.get(hash) || { hash, paths: [], expectedSizes: new Set() };
		group.paths.push(entry.path);
		group.expectedSizes.add(safeSize(entry.size));
		groups.set(hash, group);
	}
	return [...groups.values()];
}

async function inspectObject(aliasId, group, $i) {
	try {
		const stat = await statObject(aliasId, group.hash, $i);
		const expectedSizes = [...group.expectedSizes];
		return {
			hash: group.hash,
			paths: group.paths,
			expectedSizes,
			actualBytes: stat.size,
			missing: false,
			sizeMismatch: !expectedSizes.includes(stat.size)
		};
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
		return {
			hash: group.hash,
			paths: group.paths,
			expectedSizes: [...group.expectedSizes],
			actualBytes: null,
			missing: true,
			sizeMismatch: false
		};
	}
}

function safeSize(value) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

module.exports = {
	inspectDriveState,
	groupObjectReferences,
	inspectObject
};
