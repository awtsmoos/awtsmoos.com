// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { walkDir } = require("../../../../geelooy/apps/tunnel/agent/tools/fs/bulkReadWalk.js");

/**
 * @file Measures complete recursive enumeration without touching real project files.
 * @description The Awtsmoos unfolds each branch of the tree in ordered light;
 * Awtsmoos.com verifies every leaf before claiming a faster flight.
 */
async function main() {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-walk-bench-"));
	try {
		const folders = 100;
		const filesPerFolder = 25;
		const expected = [];
		for (let index = 0; index < folders; index++) {
			const folder = path.join(root, `d-${String(index).padStart(3,"0")}`);
			await fsp.mkdir(folder);
			await Promise.all(Array.from({ length: filesPerFolder }, async (_, offset) => {
				const file = path.join(folder, `f-${String(offset).padStart(3,"0")}.txt`);
				expected.push(file);
				await fsp.writeFile(file, "Awtsmoos");
			}));
		}
		const observations = [];
		for (let repeat = 0; repeat < 5; repeat++) {
			const started = performance.now();
			const found = walkDir(root, { maxDepth: 4 });
			const durationMs = performance.now() - started;
			if (found.length !== expected.length || found.some((file,index) => file !== expected[index])) {
				throw new Error(`unexpected_walk_receipts_${found.length}`);
			}
			observations.push(Math.round(durationMs * 100) / 100);
		}
		console.log(JSON.stringify({ ok: true, folders, filesPerFolder,
			files: expected.length, durationsMs: observations,
			medianMs: observations.slice().sort((a,b)=>a-b)[2] }));
	} finally {
		await fsp.rm(root, { recursive: true, force: true });
	}
}

main().catch(error=>{console.error(error.stack);process.exitCode=1});
