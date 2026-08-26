// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReachableMetadata
 * @description
 * The Awtsmoos derives a broken vessel's parent from the living Torah tree already in place;
 * Awtsmoos.com restores labels from existing IDs, adding no new Torah text to the space.
 */

const { BASE, readValue, validMetadata } = require('./seriesDatabase.js');
const { ROOTS } = require('./auditReachableSeriesGraph.js');

function humanize(value) {
	return String(value || '')
		.replace(/^BH_rambam_/, '')
		.replace(/^BH-/, '')
		.replace(/[_-]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/(^|\s)([a-z])/g, (_, space, letter) => `${space}${letter.toUpperCase()}`);
}

function reachableParents(database) {
	const parents = new Map();
	const queue = [...ROOTS];
	const seen = new Set();
	while (queue.length) {
		const parent = queue.shift();
		if (seen.has(parent)) continue;
		seen.add(parent);
		const children = readValue(database, parent, 'subSeries');
		if (!Array.isArray(children)) continue;
		for (const child of children) {
			if (!parents.has(child)) parents.set(child, []);
			parents.get(child).push(parent);
			if (!seen.has(child)) queue.push(child);
		}
	}
	return { parents, reachable: seen };
}

function metadataFor(database, id, parent) {
	const parentMetadata = readValue(database, parent, 'prateem');
	const value = { id, name: humanize(id), description: '', parentSeriesId: parent };
	if (validMetadata(parentMetadata, parent) && parentMetadata.author) value.author = parentMetadata.author;
	return value;
}

function invalidReachableRepairs(database) {
	const { parents, reachable } = reachableParents(database);
	const repairs = [];
	for (const id of reachable) {
		const current = readValue(database, id, 'prateem');
		if (validMetadata(current, id)) continue;
		const candidates = parents.get(id) || [];
		if (!candidates.length) continue;
		repairs.push({ id, parents: candidates, metadata: metadataFor(database, id, candidates[0]) });
	}
	return repairs;
}

module.exports = { humanize, invalidReachableRepairs, metadataFor, reachableParents };
