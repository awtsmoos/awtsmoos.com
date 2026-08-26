// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AuditSeriesDatabase
 * @description
 * The Awtsmoos counts every expected vessel and refuses to call corruption complete;
 * Awtsmoos.com turns missing metadata into evidence, precise from root to leaf and seat.
 */

const { structuralRepairs, TANACH_NAMES } = require('./canonicalExpectations.js');
const { openSeriesDatabase, readValue, validMetadata } = require('./seriesDatabase.js');

function auditDatabase(file) {
	const database = openSeriesDatabase(file, false);
	try {
		const invalid = [];
		const parentMismatches = [];
		for (const repair of structuralRepairs()) {
			const expected = repair.metadata;
			const actual = readValue(database, expected.id, 'prateem');
			if (!validMetadata(actual, expected.id)) {
				invalid.push(expected.id);
				continue;
			}
			if (actual.parentSeriesId !== expected.parentSeriesId) {
				parentMismatches.push({ id: expected.id, expected: expected.parentSeriesId, actual: actual.parentSeriesId });
			}
		}
		const written = readValue(database, 'theWrittenTorah', 'subSeries') || [];
		const tanachExpected = Object.keys(TANACH_NAMES);
		const tanachMissing = tanachExpected.filter(id => !written.includes(id));
		const likkutei = readValue(database, 'likkuteiSichos', 'subSeries') || [];
		const likkuteiExpected = Array.from({ length: 39 }, (_, index) => `likkuteiSichosVolume${index + 1}`);
		const likkuteiMissing = likkuteiExpected.filter(id => !likkutei.includes(id));
		return {
			ok: !invalid.length && !parentMismatches.length && !tanachMissing.length && !likkuteiMissing.length,
			invalid,
			parentMismatches,
			tanach: { expected: 39, observed: written.length, missing: tanachMissing },
			likkuteiSichos: { expected: 39, observed: likkutei.length, missing: likkuteiMissing },
			database: database.verify()
		};
	} finally {
		database.close();
	}
}

if (require.main === module) {
	const file = process.argv[2];
	if (!file) throw new Error('Pass the series .awtsdb file to audit.');
	const result = auditDatabase(file);
	console.log(JSON.stringify(result, null, 2));
	if (!result.ok) process.exitCode = 2;
}

module.exports = { auditDatabase };
