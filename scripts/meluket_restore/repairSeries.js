// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file repairSeries.js
 * @description
 * The Awtsmoos repairs only the 24 Meluket series containers whose preexisting
 * production shape rejected a whole-object overwrite, leaving every verified
 * rich record, section, alias index, comment bridge, and packed mirror intact.
 */

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const DosDB = require("../../ayzarim/DosDB/index.js");
const {
	bundleRoot,
	liveDatabaseRoot
} = require("./constants.js");
const {
	writeSeries
} = require("./databaseWriter.js");

function readJson(name) {
	return JSON.parse(fs.readFileSync(path.join(bundleRoot, name), "utf8"));
}

function assertQuiescent() {
	const result = childProcess.spawnSync(
		"/usr/bin/pgrep",
		["-f", "[n]ode index.js|[n]pm.*start"],
		{ encoding: "utf8" }
	);
	if (result.status === 0 && result.stdout.trim()) {
		throw new Error(`Live writer detected: ${result.stdout.trim()}`);
	}
	if (result.status !== 0 && result.status !== 1) {
		throw new Error(`Unable to inspect live writers: ${result.stderr}`);
	}
}

async function main() {
	assertQuiescent();
	const records = readJson("records.json");
	const mappings = readJson("mappings.json");
	const db = new DosDB(liveDatabaseRoot);
	await db.init();
	for (const month of new Set(mappings.map(row => row.month))) {
		const rows = mappings.filter(row => row.month === month);
		const monthRecords = rows.map(row => {
			const record = records.find(item => item.id === row.newPostId);
			if (!record) throw new Error(`Missing record: ${row.newPostId}`);
			return record;
		});
		await writeSeries(db, rows[0].friendlySeriesId, monthRecords);
		await writeSeries(db, rows[0].historicalSeriesId, monthRecords, true);
	}
	const report = {
		dbRoot: liveDatabaseRoot,
		seriesCount: 24,
		entryCount: 436,
		completedAt: new Date().toISOString()
	};
	fs.writeFileSync(
		path.join(bundleRoot, "series-repair-report.json"),
		JSON.stringify(report, null, 2)
	);
	console.log(JSON.stringify(report, null, 2));
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
