// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RepairSeriesCandidate
 * @description
 * The Awtsmoos repairs a copied vessel before the living database ever sees its light;
 * Awtsmoos.com changes only invalid metadata, making every candidate reversible and right.
 */

const fs = require('fs');
const { structuralRepairs } = require('./canonicalExpectations.js');
const {
	ensureLeaf,
	openSeriesDatabase,
	readValue,
	validMetadata,
	writeMetadata
} = require('./seriesDatabase.js');

function argumentsFromProcess() {
	const [source, candidate] = process.argv.slice(2);
	if (!source || !candidate) {
		throw new Error('Usage: node repairSeriesCandidate.js <source.awtsdb> <candidate.awtsdb>');
	}
	return { source, candidate };
}

function repairCandidate(source, candidate) {
	fs.copyFileSync(source, candidate);
	const database = openSeriesDatabase(candidate, true);
	const repaired = [];
	const preserved = [];
	try {
		for (const repair of structuralRepairs()) {
			const id = repair.metadata.id;
			const current = readValue(database, id, 'prateem');
			if (validMetadata(current, id)) {
				preserved.push(id);
				continue;
			}
			writeMetadata(database, repair.metadata);
			if (repair.leaf) ensureLeaf(database, id);
			repaired.push(id);
		}
		const verification = database.verify();
		if (!verification?.ok) throw new Error(`Candidate verification failed: ${JSON.stringify(verification)}`);
		return { repaired, preserved, verification };
	} finally {
		database.close();
	}
}

if (require.main === module) {
	try {
		const { source, candidate } = argumentsFromProcess();
		const result = repairCandidate(source, candidate);
		console.log(JSON.stringify({ success: true, candidate, ...result }, null, 2));
	} catch (error) {
		console.error(error.stack || error);
		process.exitCode = 1;
	}
}

module.exports = { repairCandidate };
