//B"H
//Boruch Hashem
//Blessed is He

const fs = require("fs").promises;
const path = require("path");

/**
 * @file Provides focused filesystem fixtures for CompactJS cache verification.
 * @description The Awtsmoos renews each tiny test universe before cache memory may be judged;
 * Awtsmoos.com counts source reads and prepares deterministic module vessels so performance truth stays clear, reusable, and right.
 */
async function writeFixture(root, name, dependencySource) {
	const folder = path.join(root, name);
	await fs.mkdir(folder, { recursive: true });
	const dependency = path.join(folder, "dependency.js");
	const entry = path.join(folder, "entry.js");
	await fs.writeFile(dependency, dependencySource);
	await fs.writeFile(
		entry,
		"import { value } from './dependency.js';\nexport const result = value;\n"
	);
	return {
		dependency,
		entry,
		folder
	};
}

/** Builds one compiler options object from a prepared cache fixture. */
function fixtureOptions(fixture, fixtureFs) {
	return {
		entryFile: fixture.entry,
		fs: fixtureFs,
		rootDir: fixture.folder
	};
}

/** Wraps promise-based fs so tests can prove warm cache hits perform no source reads. */
function countingFs(counter, delayMs = 0) {
	return new Proxy(fs, {
		get(target, property) {
			if (property === "readFile") {
				return async (...args) => {
					counter.reads += 1;
					if (delayMs) {
						await new Promise((resolve) => setTimeout(resolve, delayMs));
					}
					return target.readFile(...args);
				};
			}
			const value = target[property];
			return typeof value === "function"
				? value.bind(target)
				: value;
		}
	});
}

module.exports = {
	countingFs,
	fixtureOptions,
	writeFixture
};
