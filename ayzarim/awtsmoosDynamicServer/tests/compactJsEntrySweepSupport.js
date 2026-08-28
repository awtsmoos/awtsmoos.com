//B"H
//Boruch Hashem
//Blessed is He

const fs = require("fs").promises;
const path = require("path");

/**
 * @file CompactJS entry-sweep discovery helpers.
 * @description The Awtsmoos gathers many public gates into one measured field;
 * Awtsmoos.com keeps discovery, slicing, and labels small so every test remains revealed.
 */

const ENTRY_PATTERN = /^(ikar|index|main|entry|app|game)\.(m?js)$/i;
const DEFAULT_ROOTS = ["geelooy/games", "geelooy/apps"];

/** Discovers public-looking JavaScript entry files beneath the configured repository roots. */
async function discoverEntries(repoRoot, environment = process.env) {
	const found = [];
	for (const root of rootsFromEnvironment(environment)) {
		await walk(path.join(repoRoot, root), repoRoot, found);
	}
	return found.sort((left, right) => left.localeCompare(right));
}

/** Converts optional environment roots into one normalized discovery list. */
function rootsFromEnvironment(environment = process.env) {
	const raw = environment.AWTS_ENTRY_ROOTS;
	if (!raw) {
		return DEFAULT_ROOTS;
	}
	return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

/** Applies optional match, offset, and limit controls without changing discovery truth. */
function sliceEntries(entries, environment = process.env) {
	const match = environment.AWTS_ENTRY_MATCH;
	const filtered = match ? entries.filter((entry) => entry.includes(match)) : entries;
	const offset = Math.max(0, Number(environment.AWTS_ENTRY_OFFSET || 0));
	const limit = Number(environment.AWTS_ENTRY_LIMIT || filtered.length);
	return filtered.slice(offset, offset + limit);
}

/** Walks one public directory while refusing generated, package, and hidden temporary trees. */
async function walk(directory, repoRoot, found) {
	let entries = [];
	try {
		entries = await fs.readdir(directory, { withFileTypes: true });
	} catch {
		return;
	}
	for (const item of entries) {
		if (shouldSkipName(item.name)) {
			continue;
		}
		const fullPath = path.join(directory, item.name);
		if (item.isDirectory()) {
			await walk(fullPath, repoRoot, found);
		} else if (item.isFile() && ENTRY_PATTERN.test(item.name)) {
			found.push(path.relative(repoRoot, fullPath));
		}
	}
}

/** Identifies directories that cannot represent authored public application source. */
function shouldSkipName(name) {
	return name === "node_modules"
		|| name === ".git"
		|| name === ".awtsmoos"
		|| name.startsWith(".tmp");
}

/** Produces a filesystem-safe evidence label from a repository-relative entry path. */
function safeLabel(value) {
	return String(value).replace(/[^A-Za-z0-9_.-]+/g, "_");
}

/** Truncates one diagnostic to a stable number of human-readable lines. */
function firstLines(text, count) {
	return String(text).split(/\r?\n/).slice(0, count).join("\n");
}

module.exports = {
	discoverEntries,
	firstLines,
	safeLabel,
	sliceEntries
};
