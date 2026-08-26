// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RepairReachableCandidate
 * @description
 * The Awtsmoos joins broken links before restoring metadata across the living Ikar light;
 * Awtsmoos.com repairs only graph vessels in a copy, preserving Torah text byte-for-byte and right.
 */

const fs = require('fs');
const awtsmoosJSON = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');
const { invalidReachableRepairs } = require('./reachableMetadata.js');
const { MELUKET_MONTHS, normalizedLikkuteiTorah } = require('./structuralNormalizations.js');
const { openSeriesDatabase, pathFor, readValue, writeMetadata } = require('./seriesDatabase.js');

function writeArray(database, id, name, value) {
	database.fs.write(pathFor(id, name), awtsmoosJSON.serializeArray(value));
}

function normalizeGraph(database) {
	const currentLikkutei = readValue(database, 'likkuteiTorah', 'subSeries');
	writeArray(database, 'likkuteiTorah', 'subSeries', normalizedLikkuteiTorah(currentLikkutei));
	for (const month of MELUKET_MONTHS) writeArray(database, month, 'subSeries', []);
}

function repairCandidate(source, candidate) {
	fs.copyFileSync(source, candidate);
	const database = openSeriesDatabase(candidate, true);
	try {
		normalizeGraph(database);
		const metadataRepairs = invalidReachableRepairs(database);
		for (const repair of metadataRepairs) writeMetadata(database, repair.metadata);
		const verification = database.verify();
		if (!verification?.ok) throw new Error(`Candidate verification failed: ${JSON.stringify(verification)}`);
		return {
			metadataRepairs,
			normalizedLinks: 6,
			normalizedMeluketLeaves: MELUKET_MONTHS.length,
			verification
		};
	} finally {
		database.close();
	}
}

if (require.main === module) {
	const [source, candidate] = process.argv.slice(2);
	if (!source || !candidate) throw new Error('Usage: node repairReachableCandidate.js <source> <candidate>');
	const result = repairCandidate(source, candidate);
	console.log(JSON.stringify({ success: true, candidate, ...result }, null, 2));
}

module.exports = { normalizeGraph, repairCandidate };
