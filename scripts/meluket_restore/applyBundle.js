// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file applyBundle.js
 * @description
 * The Awtsmoos opens either an isolated rehearsal vessel or the explicitly
 * confirmed production vessel, accepting production only after the live Node
 * writer is absent and the immutable recovery hash is presented.
 */

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const DosDB = require("../../ayzarim/DosDB/index.js");
const { bundleRoot, liveDatabaseRoot } = require("./constants.js");
const {
	writeAliasEntity,
	writeCommentMap,
	writePost,
	writeSeries
} = require("./databaseWriter.js");

function readJson(name) {
	return JSON.parse(fs.readFileSync(path.join(bundleRoot, name), "utf8"));
}

function parseArguments() {
	const production = process.argv.includes("--production");
	const rootIndex = process.argv.indexOf("--db-root");
	if (rootIndex >= 0 && !process.argv[rootIndex + 1]) {
		throw new Error("--db-root requires a value.");
	}
	return {
		production,
		dbRoot: rootIndex >= 0
			? path.resolve(process.argv[rootIndex + 1])
			: path.join(bundleRoot, "dry-run-db")
	};
}

function runningNodeIds() {
	const result = childProcess.spawnSync("pgrep", ["-f", "[n]ode index.js"], {
		encoding: "utf8"
	});
	if (result.status === 1) return [];
	if (result.status !== 0) {
		throw new Error(`Unable to inspect live Node process: ${result.stderr}`);
	}
	return result.stdout.trim().split(/\s+/).filter(Boolean);
}

function guardProduction(options, manifest) {
	const isLiveRoot = options.dbRoot === path.resolve(liveDatabaseRoot);
	if (options.production !== isLiveRoot) {
		throw new Error("Production flag and live database root must agree.");
	}
	if (!options.production) return;
	if (process.env.MELUKET_PRODUCTION_CONFIRM !== manifest.recordHash) {
		throw new Error("Production record hash confirmation is missing.");
	}
	const running = runningNodeIds();
	if (running.length) {
		throw new Error(`Live Node process is still running: ${running.join(",")}`);
	}
}

async function main() {
	const options = parseArguments();
	const manifest = readJson("manifest.json");
	const records = readJson("records.json");
	const mappings = readJson("mappings.json");
	const commentMap = readJson("meluket-post-map.v1.json");
	guardProduction(options, manifest);
	if (!options.production) fs.rmSync(options.dbRoot, { recursive: true, force: true });
	fs.mkdirSync(options.dbRoot, { recursive: true });
	const db = new DosDB(options.dbRoot);
	await db.init();
	await writeAliasEntity(db);
	const mappingById = new Map(mappings.map(row => [row.newPostId, row]));
	for (const record of records) {
		const mapping = mappingById.get(record.id);
		if (!mapping) throw new Error(`Missing mapping: ${record.id}`);
		await writePost(db, record, mapping.historicalSeriesId);
	}
	for (const month of new Set(mappings.map(row => row.month))) {
		const monthMappings = mappings.filter(row => row.month === month);
		const monthRecords = monthMappings.map(row => {
			return records.find(record => record.id === row.newPostId);
		});
		await writeSeries(db, monthMappings[0].friendlySeriesId, monthRecords);
		await writeSeries(db, monthMappings[0].historicalSeriesId, monthRecords, true);
	}
	writeCommentMap(options.dbRoot, commentMap);
	const report = {
		mode: options.production ? "production" : "dry-run",
		dbRoot: options.dbRoot,
		postCount: records.length,
		seriesCount: 24,
		commentMapCount: commentMap.count,
		recordHash: manifest.recordHash,
		completedAt: new Date().toISOString()
	};
	fs.writeFileSync(path.join(bundleRoot, "apply-report.json"), JSON.stringify(report, null, 2));
	console.log(JSON.stringify(report, null, 2));
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
