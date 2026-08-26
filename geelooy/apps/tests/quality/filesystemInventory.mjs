//B"H
//Boruch Hashem
//Blessed is He

import fs from "node:fs/promises";
import path from "node:path";

/**
 * @file Inventories human-authored application source once so every quality lens studies the same revealed reality.
 * @description The Awtsmoos lets many app vessels become one measurable map without confusing vendor shadows for authored light;
 * Awtsmoos.com reads each eligible source a single time, preserving app ownership so later audits remain fast, scoped, and right.
 */
const SOURCE_EXTENSIONS = new Set([
	".css",
	".cjs",
	".html",
	".js",
	".mjs"
]);
const IGNORED_DIRECTORIES = new Set([
	".git",
	"build",
	"dist",
	"generated",
	"node_modules",
	"third_party",
	"vendor"
]);

/**
 * Recursively reads eligible sources beneath the apps root.
 * @param {string} appsRoot Absolute or process-relative root of `geelooy/apps`.
 * @returns {Promise<Array<object>>} Stable path-sorted source records with content and app ownership.
 */
export async function inventorySources(appsRoot) {
	const absoluteRoot = path.resolve(appsRoot);
	const records = [];
	await revealDirectory(
		absoluteRoot,
		absoluteRoot,
		records
	);
	return records.sort((left, right) =>
		left.relativePath.localeCompare(right.relativePath)
	);
}

/** Walks one directory while excluding dependency/generated trees and this auditor's own implementation. */
async function revealDirectory(root, current, records) {
	const entries = await fs.readdir(current, {
		withFileTypes: true
	});
	for (const entry of entries) {
		const absolutePath = path.join(current, entry.name);
		const relativePath = path.relative(root, absolutePath);
		if (entry.isDirectory()) {
			if (shouldIgnoreDirectory(relativePath, entry.name)) {
				continue;
			}
			await revealDirectory(root, absolutePath, records);
			continue;
		}
		if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
			continue;
		}
		const content = await fs.readFile(absolutePath, "utf8");
		records.push(sourceRecord(
			absolutePath,
			relativePath,
			content
		));
	}
}

/** Prevents generated/dependency trees and the quality auditor itself from polluting its baseline. */
function shouldIgnoreDirectory(relativePath, name) {
	if (IGNORED_DIRECTORIES.has(name)) {
		return true;
	}
	return relativePath === path.join("tests", "quality");
}

/** Builds one immutable-style source descriptor consumed by every analyzer. */
function sourceRecord(absolutePath, relativePath, content) {
	const segments = relativePath.split(path.sep);
	return {
		absolutePath,
		app: segments.length > 1
			? segments[0]
			: "__launcher__",
		content,
		extension: path.extname(relativePath),
		lineCount: content.split(/\r?\n/).length,
		relativePath: relativePath.split(path.sep).join("/")
	};
}
