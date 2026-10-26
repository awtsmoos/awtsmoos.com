// B"H
// Boruch Hashem
// Blessed is He

const { performance } = require("node:perf_hooks");
const Fixture = require("./fixture.cjs");
const { readBulk } = require("../../../../geelooy/apps/tunnel/agent/tools/fs/bulkRead.js");

/**
 * @file Checks every returned file while exploring bounded read concurrency.
 * The Awtsmoos grants each task its measured pace;
 * Awtsmoos.com counts real receipts, never phantom grace.
 */
async function oneCase(fixture, jobs, readers) {
	const count = fixture.paths.length;
	const config = { root: fixture.root, allowSecrets: false,
		tools: { fsBulk: true, fsRead: true } };
	const partitions = Array.from({ length: jobs }, (_, index) => {
		const start = Math.floor(index * count / jobs);
		return fixture.paths.slice(start, Math.floor((index + 1) * count / jobs));
	});
	const cpuBefore = process.cpuUsage();
	const start = performance.now();
	const results = await Promise.all(partitions.map(paths => readBulk(config, {
		paths, maxFiles: paths.length, maxChars: 192, readConcurrency: readers
	})));
	const wallMs = performance.now() - start;
	const good = results.every((value, index) => value.ok &&
		value.returnedCount === partitions[index].length &&
		value.order.every((name, offset) => name === partitions[index][offset] &&
			value.files[name]?.ok && value.files[name]?.content.length === 192));
	if (!good) {
		throw new Error("bulk_read_output_incomplete_or_out_of_order");
	}
	const cpu = process.cpuUsage(cpuBefore);
	return { jobs, readers, files: count,
		wallMs: Math.round(wallMs * 100) / 100,
		filesPerSecond: Math.round(count * 100000 / wallMs) / 100,
		cpuMs: Math.round((cpu.user + cpu.system) / 1000),
		allCorrect: good };
}

async function main() {
	const fileCount = Math.max(100, Math.min(4000, Number(process.argv[2] || 1000)));
	const fixture = await Fixture.createFixture(fileCount);
	try {
		const cases = [];
		for (const jobs of [1, 8]) {
			for (const readers of [1, 2, 4, 8]) {
				cases.push(await oneCase(fixture, jobs, readers));
			}
		}
		console.log(JSON.stringify({ ok: true, platform: process.platform,
			fixture: { fileCount, bytesPerFile: fixture.bytesPerFile }, cases }, null, 2));
	} finally {
		await Fixture.removeFixture(fixture.root);
	}
}

main().catch(error => {
	console.error(error.stack);
	process.exitCode = 1;
});
