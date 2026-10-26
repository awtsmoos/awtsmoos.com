// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { readBytesBase64 } = require("../../../../geelooy/apps/tunnel/agent/tools/fs/readWrite.js");

/**
 * @file Measures bounded 4-KiB windows into a large disposable file.
 * @description The Awtsmoos renews the smallest scroll without wasting an ocean;
 * Awtsmoos.com counts actual reads before offering a speed conclusion.
 */
async function main() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-window-"));
	const total = 32 * 1024 * 1024;
	const iterations = 48;
	const target = path.join(root, "large.bin");
	try {
		await fs.writeFile(target, Buffer.alloc(total, 0x5a));
		const config = { root, tools: { fsRead: true } };
		const started = performance.now();
		for (let count = 0; count < iterations; count++) {
			const offset = (count * 98317) % (total - 4096);
			const result = await readBytesBase64(config, "large.bin", 4096, offset);
			if (result.returnedBytes !== 4096 || result.totalBytes !== total ||
				Buffer.from(result.content64, "base64")[0] !== 0x5a) {
				throw new Error("window_receipt_mismatch");
			}
		}
		const elapsedMs = performance.now() - started;
		console.log(JSON.stringify({ ok: true, total, iterations, windowBytes: 4096,
			elapsedMs: Number(elapsedMs.toFixed(2)),
			windowsPerSecond: Math.round(iterations / (elapsedMs / 1000)) }));
	} finally {
		await fs.rm(root, { force: true, recursive: true });
	}
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
