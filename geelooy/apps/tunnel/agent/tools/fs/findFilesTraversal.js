// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const FsError = require("./filesystemError.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * @file Holds guarded findFiles traversal mechanics outside the recursive orchestration vessel.
 * @description
 * The Awtsmoos lets root judgment, permission skips, metadata reads, and traversal bounds
 * each speak clearly; Awtsmoos.com keeps these repeated mechanics outside the walker so the
 * search path stays spacious while every policy fence and diagnostic remains fully visible.
 */
function guardedStart(config, requestedPath) {
	try {
		return safePath(config, requestedPath);
	} catch (error) {
		throw FsError.decorate(config, error, "find_root", requestedPath);
	}
}

async function readEntries(config, directory, requestedPath, depth, diagnostics, state) {
	try {
		return await fsp.readdir(directory, { withFileTypes: true });
	} catch (error) {
		if (depth === 0) {
			throw FsError.decorate(config, error, "find_list_root", requestedPath);
		}
		state.skipped += 1;
		diagnostics.add(error, "find_list", directory);
		return null;
	}
}

function guardFile(config, full, diagnostics, state) {
	try {
		assertNotSecret(config, full);
		return true;
	} catch (error) {
		state.skipped += 1;
		diagnostics.add(error, "find_secret_skip", full);
		return false;
	}
}

async function withStat(item, full, diagnostics) {
	try {
		const stat = await fsp.stat(full);
		return {
			...item,
			sizeBytes: item.isDirectory ? 0 : stat.size,
			mtimeMs: stat.mtimeMs
		};
	} catch (error) {
		diagnostics.add(error, "find_stat", full);
		return item;
	}
}

function stopIfBounded(state, options, pageSize) {
	if (state.visited >= options.maxVisited) {
		state.stoppedReason = "max_visited";
	} else if (state.results.length >= pageSize) {
		state.stoppedReason = "page_full";
	}
	return Boolean(state.stoppedReason);
}

module.exports = {
	guardedStart,
	guardFile,
	readEntries,
	stopIfBounded,
	withStat
};
