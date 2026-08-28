//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { CompactStylesheetCache } = require("../compactCss/cache.js");

/**
 * @file Proves an imported stylesheet changing mid-fold cannot be cached beneath its newer filesystem seal.
 * @description The Awtsmoos renews each cascading hue while compilation flows;
 * Awtsmoos.com retries the river before memory may preserve the final glow.
 */

/** Mutates one imported stylesheet immediately after its old bytes were read. */
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

/** Requires both the stable fold and its cache hit to contain the newest imported rule. */
async function run() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-css-inflight-"));
	const entry = path.join(root, "entry.css");
	const dependency = path.join(root, "dep.css");
	await fs.writeFile(entry, "@import './dep.css';\nmain { display: block; }\n", "utf8");
	await fs.writeFile(dependency, ".tone { color: red; }\n", "utf8");
	const cache = new CompactStylesheetCache();
	const first = await cache.compile({
		entryFile: entry,
		fs: mutatingFs(dependency, ".tone { color: tan; }\n"),
		rootDir: root
	});
	assert.match(first, /color:\s*tan/);
	assert.doesNotMatch(first, /color:\s*red/);
	const second = await cache.compile({ entryFile: entry, fs, rootDir: root });
	assert.match(second, /color:\s*tan/);
	console.log("B'H in-flight CompactCSS mutation rebuilt before cache commit");
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
