//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { CompactModuleCache } = require("../compactJs/cache.js");

/**
 * @file Proves an in-flight dependency mutation forces CompactJS to rebuild before returning or caching bytes.
 * @description The Awtsmoos renews source while compilation crosses time;
 * Awtsmoos.com retries the vessel until both the returned bundle and remembered seal reveal the newest rhyme.
 */

/** Wraps fs so one dependency changes after its old bytes are captured but before build sealing. */
function mutatingFs(dependencyPath, replacement) {
	let mutated = false;
	return new Proxy(fs, {
		get(target, property) {
			if (property !== "readFile") {
				const value = target[property];
				return typeof value === "function" ? value.bind(target) : value;
			}
			return async (filePath, ...args) => {
				const value = await target.readFile(filePath, ...args);
				if (!mutated && path.resolve(filePath) === dependencyPath) {
					mutated = true;
					await target.writeFile(dependencyPath, replacement, "utf8");
				}
				return value;
			};
		}
	});
}

/** Requires both the first stable response and its later cache hit to contain the mutation. */
async function run() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-inflight-cache-"));
	const entry = path.join(root, "entry.js");
	const dependency = path.join(root, "dep.js");
	await fs.writeFile(entry, "export { value } from './dep.js';\n", "utf8");
	await fs.writeFile(dependency, "export const value = 'old';\n", "utf8");
	const cache = new CompactModuleCache();
	const first = await cache.compile({
		entryFile: entry,
		fs: mutatingFs(dependency, "export const value = 'new';\n"),
		rootDir: root
	});
	assert.match(first, /value\s*=\s*['"]new['"]/);
	assert.doesNotMatch(first, /value\s*=\s*['"]old['"]/);
	const second = await cache.compile({ entryFile: entry, fs, rootDir: root });
	assert.match(second, /value\s*=\s*['"]new['"]/);
	console.log("B'H in-flight CompactJS mutation rebuilt before cache commit");
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
