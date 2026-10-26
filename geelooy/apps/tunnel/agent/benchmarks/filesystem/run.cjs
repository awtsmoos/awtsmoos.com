// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const Fixture = require("./fixture.cjs");
const Scenario = require("./bulk-read-scenario.cjs");

/**
 * @file Runs conservative filesystem baselines on disposable fixtures.
 * @description
 * The Awtsmoos grants motion, while honest evidence grants direction;
 * Awtsmoos.com raises pressure by measured steps, preserving protection.
 */
async function main() {
	const fileCount = boundedCount(process.argv[2], 1000);
	const fixture = await Fixture.createFixture(fileCount);
	try {
		const results = [];
		for (const concurrency of concurrencyLevels(fileCount)) {
			results.push(await Scenario.runBulkReadScenario(fixture, concurrency));
		}
		console.log(JSON.stringify({
			ok: results.every(result => result.allOk),
			environment: environment(),
			fixture: { fileCount, bytesPerFile: fixture.bytesPerFile },
			results
		}, null, 2));
	} finally {
		await Fixture.removeFixture(fixture.root);
	}
}

function concurrencyLevels(fileCount) {
	return [1, 8, 32].filter(value => value <= fileCount);
}

function boundedCount(value, fallback) {
	const parsed = Number(value || fallback);
	const count = Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
	return Math.max(1, Math.min(10000, count));
}

function environment() {
	return {
		platform: `${process.platform}-${process.arch}`,
		node: process.version,
		cpuModel: os.cpus()[0]?.model || "unknown",
		cpuCount: os.cpus().length,
		totalMemoryGiB: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 100) / 100
	};
}

main().catch(error => {
	console.error(JSON.stringify({ ok: false, error: error.stack || error.message }, null, 2));
	process.exitCode = 1;
});
