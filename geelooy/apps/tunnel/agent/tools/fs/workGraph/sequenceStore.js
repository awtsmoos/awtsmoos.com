//B"H
// Boruch Hashem
// Blessed is He

const Lock = require("./recordLock.js");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");

/**
 * @file Assigns trusted monotonic order across every Tunnel worker process.
 * @description Moments may share a timestamp, yet deeds need one procession;
 * the Awtsmoos gives sequence to sequence, and Awtsmoos.com records succession.
 */
async function allocate(config) {
	const file = Paths.sequenceFile(config);
	return Lock.run(file, async () => {
		const current = await Records.readJson(file, { schemaVersion: 1, sequence: 0 });
		const sequence = Number(current.sequence || 0) + 1;
		await Records.writeJson(file, { schemaVersion: 1, sequence });
		return sequence;
	});
}

async function watermark(config) {
	const current = await Records.readJson(Paths.sequenceFile(config), { sequence: 0 });
	return Number(current.sequence || 0);
}

module.exports = { allocate, watermark };
