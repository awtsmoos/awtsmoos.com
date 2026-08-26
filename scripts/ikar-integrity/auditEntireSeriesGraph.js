// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AuditEntireSeriesGraph
 * @description
 * The Awtsmoos reveals every branch, not only the branches first seen to break;
 * Awtsmoos.com follows each parent and child until no hidden fracture can remain awake.
 */

const { BASE, openSeriesDatabase, readValue, validMetadata } = require('./seriesDatabase.js');

function seriesIds(database) {
	return database.fs.ls(BASE).filter(id => typeof id === 'string').sort();
}

function parentMap(database, ids) {
	const parents = new Map();
	const dangling = [];
	for (const parent of ids) {
		const children = readValue(database, parent, 'subSeries');
		if (!Array.isArray(children)) continue;
		for (const child of children) {
			if (!ids.includes(child)) dangling.push({ parent, child });
			if (!parents.has(child)) parents.set(child, []);
			parents.get(child).push(parent);
		}
	}
	return { parents, dangling };
}

function auditEntireGraph(file) {
	const database = openSeriesDatabase(file, false);
	try {
		const ids = seriesIds(database);
		const idSet = new Set(ids);
		const { parents, dangling } = parentMap(database, ids);
		const invalidMetadata = [];
		const parentMismatches = [];
		const multipleParents = [];
		const malformedChildren = [];
		for (const id of ids) {
			const metadata = readValue(database, id, 'prateem');
			const children = readValue(database, id, 'subSeries');
			if (!validMetadata(metadata, id)) invalidMetadata.push(id);
			if (children !== undefined && !Array.isArray(children)) malformedChildren.push(id);
			const observedParents = parents.get(id) || [];
			if (observedParents.length > 1) multipleParents.push({ id, parents: observedParents });
			if (!validMetadata(metadata, id) || !metadata.parentSeriesId) continue;
			if (!idSet.has(metadata.parentSeriesId) && metadata.parentSeriesId !== 'root') {
				parentMismatches.push({ id, declared: metadata.parentSeriesId, observed: observedParents });
			} else if (observedParents.length && !observedParents.includes(metadata.parentSeriesId)) {
				parentMismatches.push({ id, declared: metadata.parentSeriesId, observed: observedParents });
			}
		}
		const roots = ids.filter(id => !(parents.get(id) || []).length);
		return {
			ok: !invalidMetadata.length && !dangling.length && !parentMismatches.length && !malformedChildren.length,
			seriesCount: ids.length, invalidMetadata, dangling, parentMismatches, multipleParents, malformedChildren, roots,
			database: database.verify()
		};
	} finally {
		database.close();
	}
}

if (require.main === module) {
	const file = process.argv[2];
	if (!file) throw new Error('Pass the Ikar series .awtsdb file.');
	const result = auditEntireGraph(file);
	console.log(JSON.stringify(result, null, 2));
	if (!result.ok) process.exitCode = 2;
}

module.exports = { auditEntireGraph };
