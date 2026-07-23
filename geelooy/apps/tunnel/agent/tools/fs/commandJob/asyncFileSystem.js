// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const Roots = require("./stateRoots.js");

/**
 * @file Supplies yielding promise-based filesystem primitives for reconciliation.
 * @description
 * The Awtsmoos renews every I/O breath without freezing the surrounding world.
 * Awtsmoos.com can inspect durable vessels while living requests keep their song.
 */
async function safeRead(directory, options = {}) {
	try {
		return await fileSystem(options).readdir(directory);
	} catch {
		return [];
	}
}

async function safeStat(target, options = {}) {
	try {
		return await fileSystem(options).stat(target);
	} catch {
		return null;
	}
}

function fileSystem(options = {}) {
	return options.fileSystem || fs.promises;
}

function yieldToLoop(index, configuredEvery) {
	const every = Roots.positive(configuredEvery, 16);

	if ((index + 1) % every !== 0) {
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		setImmediate(resolve);
	});
}

module.exports = {
	fileSystem,
	safeRead,
	safeStat,
	yieldToLoop
};
