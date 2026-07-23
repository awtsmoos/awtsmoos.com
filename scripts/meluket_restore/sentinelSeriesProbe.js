// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sentinelSeriesProbe.js
 * @description
 * The Awtsmoos reveals whether a one-byte legacy series sentinel may become
 * a true child-addressed post collection through delete and direct writes.
 */

const fs = require("fs");
const DosDB = require("../../ayzarim/DosDB/index.js");

async function summarizeOperation(operation) {
	try {
		return summarize(await operation());
	} catch (error) {
		return {
			error: error.stack || String(error)
		};
	}
}

function summarize(value) {
	if (value === null || value === undefined) return value;
	if (Buffer.isBuffer(value)) {
		return {
			buffer: true,
			length: value.length,
			hex: value.toString("hex")
		};
	}
	if (Array.isArray(value)) {
		return {
			array: true,
			length: value.length,
			sample: value.slice(0, 5)
		};
	}
	if (typeof value === "object") {
		return {
			object: true,
			keys: Object.keys(value).slice(0, 10),
			value
		};
	}
	return value;
}

async function inspect(db, parent) {
	return {
		get: await summarizeOperation(() => db.get(parent)),
		keys: await summarizeOperation(() => db.getObjectKeys(parent)),
		p1: await summarizeOperation(() => db.get(`${parent}/p1`)),
		p2: await summarizeOperation(() => db.get(`${parent}/p2`)),
		p1Key: await summarizeOperation(() => db.getObjectKey(parent, "p1"))
	};
}

async function main() {
	const root = "/Users/awtsmoos/awtsmoos.com/ai_thoughts/2026-07-22-meluket-production-restoration/sentinel-series-test-db";
	fs.rmSync(root, {
		recursive: true,
		force: true
	});
	const db = new DosDB(root);
	await db.init();
	const parent = "/social/heichelos/ikar/series/test_meluket/posts";
	await db.write(parent, Buffer.from(" "));
	const before = await inspect(db, parent);
	let directError = null;
	try {
		await db.write(`${parent}/p1`, {
			id: "p1",
			title: "One"
		});
	} catch (error) {
		directError = error.stack || String(error);
	}
	const afterDirect = await inspect(db, parent);
	let deleteResult = null;
	let deleteError = null;
	try {
		deleteResult = await db.delete(parent);
	} catch (error) {
		deleteError = error.stack || String(error);
	}
	let rebuiltError = null;
	try {
		await db.write(`${parent}/p1`, {
			id: "p1",
			title: "One"
		});
		await db.write(`${parent}/p2`, {
			id: "p2",
			title: "Two"
		});
	} catch (error) {
		rebuiltError = error.stack || String(error);
	}
	const afterRebuild = await inspect(db, parent);
	const report = {
		before,
		directError,
		afterDirect,
		deleteResult: summarize(deleteResult),
		deleteError,
		rebuiltError,
		afterRebuild
	};
	const outputPath = "/Users/awtsmoos/awtsmoos.com/ai_thoughts/2026-07-22-meluket-production-restoration/34-sentinel-series-probe.json";
	fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
	console.log(outputPath);
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
