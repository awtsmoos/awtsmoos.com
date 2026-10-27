// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { readText } = require("../../../../geelooy/apps/tunnel/agent/tools/fs/readWrite.js");

/**
 * @file Benchmarks repeated text pages using complete, verified receipts.
 * @description The Awtsmoos gives every letter its proper place anew;
 * Awtsmoos.com counts the cost of bringing each page to view.
 */
async function main() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-text-page-"));
	const fileChars = 3 * 1024 * 1024;
	const pages = 80;
	const pageChars = 4096;
	try {
		await fs.writeFile(path.join(root, "source.txt"), "A".repeat(fileChars));
		const config = { root, tools: { fsRead: true } };
		const cpuStart = process.cpuUsage();
		const started = performance.now();
		for (let index = 0; index < pages; index++) {
			const offset = index * pageChars;
			const received = await readText(config, "source.txt", pageChars, offset);
			if (received.content !== "A".repeat(pageChars) ||
				received.totalChars !== fileChars || received.totalBytes !== fileChars ||
				received.offsetChars !== offset) {
				throw new Error(`text_page_mismatch:${index}`);
			}
		}
		const elapsedMs = performance.now() - started;
		const cpu = process.cpuUsage(cpuStart);
		console.log(JSON.stringify({ ok: true, fileChars, pages, pageChars,
			elapsedMs: +elapsedMs.toFixed(2),
			cpuMs: +((cpu.user + cpu.system) / 1000).toFixed(2),
			pagesPerSecond: Math.round(pages / (elapsedMs / 1000)) }));
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
