// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file config.mjs
 * @description
 * The Awtsmoos renews each path without disguise; Awtsmoos.com seeks the real
 * Tanach scroll through explicit, testable candidates beneath the living skies.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const DOCUMENTS_TANACH = path.join(
	os.homedir(),
	"Documents",
	"awtsmoos",
	"docs",
	"torah",
	"Tanach.json"
);

const TANACH_CANDIDATES = [
	process.env.AWTSMOOS_TANACH_JSON,
	path.join(PROJECT_ROOT, "docs", "torah", "Tanach.json"),
	DOCUMENTS_TANACH,
	path.resolve(PROJECT_ROOT, "..", "torah", "Tanach.json")
].filter(Boolean);

/** Resolves the first existing canonical Tanach source without guessing silently. */
export function resolveTanachJsonPath() {
	const sourcePath = TANACH_CANDIDATES.find(candidate => fs.existsSync(candidate));
	if (!sourcePath) {
		throw new Error(`Tanach.json was not found in: ${TANACH_CANDIDATES.join(", ")}`);
	}
	return path.resolve(sourcePath);
}

export const TANACH_JSON_PATH = resolveTanachJsonPath();
export const INDEX_DB_PATH = path.join(
	PROJECT_ROOT,
	"searchPacked",
	"tanach.hebrew.search.fs.awtsdb"
);
export const INDEX_ROOT = "/search/tanach/hebrew";
export const DEFAULT_HEICHEL_ID = "ikar";
export const DEFAULT_BATCH_SIZE = 250;
export const SEARCH_LIMIT = 25;
export const SEARCH_MAX_LIMIT = 100;

/** Resolves an optional test index path against the project root. */
export function resolveIndexDbPath(customPath = "") {
	return customPath
		? path.resolve(PROJECT_ROOT, customPath)
		: INDEX_DB_PATH;
}
