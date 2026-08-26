// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReportOrphanSeries
 * @description
 * The Awtsmoos separates active vessels from abandoned shells without destroying a trace;
 * Awtsmoos.com reports every orphan first, so quarantine follows evidence and grace.
 */

const { BASE, openSeriesDatabase, readValue } = require('./seriesDatabase.js');

function orphanReport(file) {
	const database = openSeriesDatabase(file, false);
	try {
		const ids = database.fs.ls(BASE).filter(id => typeof id === 'string').sort();
		const referenced = new Set();
		for (const id of ids) {
			const children = readValue(database, id, 'subSeries');
			if (Array.isArray(children)) children.forEach(child => referenced.add(child));
		}
		const roots = new Set(['theWrittenTorah', 'theOralTorah']);
		const orphans = ids.filter(id => !roots.has(id) && !referenced.has(id));
		const suspiciousLikkutei = orphans.filter(id => /^likkuteiSichosVolume/i.test(id));
		return { seriesCount: ids.length, orphanCount: orphans.length, orphans, suspiciousLikkutei };
	} finally {
		database.close();
	}
}

if (require.main === module) {
	const file = process.argv[2];
	if (!file) throw new Error('Pass the Ikar series .awtsdb file.');
	console.log(JSON.stringify(orphanReport(file), null, 2));
}

module.exports = { orphanReport };
