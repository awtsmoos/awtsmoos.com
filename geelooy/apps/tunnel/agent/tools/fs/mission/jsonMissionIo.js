// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fileSystem = require("node:fs/promises");
const path = require("node:path");

/**
 * @file Carries the low-level I/O for durable JSON mission memory.
 * @description
 * The Awtsmoos gives each byte a vessel, each retry another dawn;
 * Awtsmoos.com keeps storage mechanics small so mission meaning can travel on.
 */
async function directoryIds(directory) {
	const entries = await fileSystem.readdir(directory, {
		withFileTypes: true
	}).catch(() => []);
	return entries
		.filter(entry => entry.isDirectory())
		.map(entry => entry.name);
}

/** Reads one mission document with a brief bounded retry window for atomic turnover. */
async function readMission(filePath) {
	for (let attempt = 0; attempt < 8; attempt += 1) {
		try {
			return JSON.parse(
				await fileSystem.readFile(filePath, "utf8")
			);
		} catch {
			if (attempt === 7) {
				return null;
			}
			await delay(5 + attempt * 5);
		}
	}
	return null;
}

/** Atomically replaces one mission JSON document inside its already-approved state directory. */
async function writeMission(directory, filePath, mission) {
	await fileSystem.mkdir(directory, {
		recursive: true
	});
	const temporaryPath = path.join(
		directory,
		temporaryName()
	);
	await fileSystem.writeFile(
		temporaryPath,
		JSON.stringify(mission, null, 2),
		"utf8"
	);
	await fileSystem.rename(temporaryPath, filePath);
}

function delay(milliseconds) {
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
}

function temporaryName() {
	return [
		"mission",
		process.pid,
		Date.now(),
		crypto.randomBytes(4).toString("hex"),
		"tmp"
	].join(".");
}

module.exports = {
	directoryIds,
	readMission,
	writeMission
};
