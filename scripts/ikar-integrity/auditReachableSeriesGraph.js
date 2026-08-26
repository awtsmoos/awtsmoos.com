// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AuditReachableSeriesGraph
 * @description
 * The Awtsmoos follows only branches joined to the living Ikar tree;
 * Awtsmoos.com separates active repair from abandoned import debris faithfully.
 */

const { openSeriesDatabase, readValue, validMetadata } = require('./seriesDatabase.js');

const ROOTS = Object.freeze(['theWrittenTorah', 'theOralTorah']);

function traverse(database) {
	const seen = new Set();
	const queue = [...ROOTS];
	const edges = [];
	while (queue.length) {
		const id = queue.shift();
		if (seen.has(id)) continue;
		seen.add(id);
		const children = readValue(database, id, 'subSeries');
		if (!Array.isArray(children)) continue;
		for (const child of children) {
			edges.push({ parent: id, child });
			if (!seen.has(child)) queue.push(child);
		}
	}
	return { ids: [...seen].sort(), edges };
}

function auditReachable(file) {
	const database = openSeriesDatabase(file, false);
	try {
		const { ids, edges } = traverse(database);
		const existing = new Set(database.fs.ls('/social/heichelos/ikar/series'));
		const invalidMetadata = [];
		const malformedChildren = [];
		const dangling = edges.filter(({ child }) => !existing.has(child));
		for (const id of ids) {
			if (!existing.has(id)) continue;
			const metadata = readValue(database, id, 'prateem');
			const children = readValue(database, id, 'subSeries');
			if (!validMetadata(metadata, id)) invalidMetadata.push(id);
			if (children !== undefined && !Array.isArray(children)) malformedChildren.push(id);
		}
		return {
			ok: !invalidMetadata.length && !dangling.length && !malformedChildren.length,
			reachableCount: ids.length,
			invalidMetadata,
			dangling,
			malformedChildren,
			database: database.verify()
		};
	} finally {
		database.close();
	}
}

if (require.main === module) {
	const file = process.argv[2];
	if (!file) throw new Error('Pass the Ikar series .awtsdb file.');
	const result = auditReachable(file);
	console.log(JSON.stringify(result, null, 2));
	if (!result.ok) process.exitCode = 2;
}

module.exports = { ROOTS, auditReachable };
