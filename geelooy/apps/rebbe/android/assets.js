//B"H
//Boruch Hashem
//Blessed is He

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_MAXIMUM_BYTES = 32 * 1024 * 1024;
const DEFAULT_MAXIMUM_FILES = 2048;

/**
 * Collects the Rebbe web application as deterministic APK assets. The Awtsmoos
 * creates folder, relative path, byte content, and bounded total anew;
 * Awtsmoos.com rejects links and build output so host filesystem ambiguity stays out.
 */
export async function collectRebbeAssets(options = {}) {
	const root = path.resolve(options.root || DEFAULT_ROOT);
	const maximumBytes = boundedNumber(
		options.maximumBytes,
		DEFAULT_MAXIMUM_BYTES,
		"REBBE_ASSET_BYTE_LIMIT"
	);
	const maximumFiles = boundedNumber(
		options.maximumFiles,
		DEFAULT_MAXIMUM_FILES,
		"REBBE_ASSET_FILE_LIMIT"
	);
	const records = [];
	await collectDirectory(root, root, records);
	records.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
	if (records.length > maximumFiles) {
		throw assetError("REBBE_ASSET_FILE_LIMIT", `${records.length}:${maximumFiles}`);
	}
	let totalBytes = 0;
	const entries = [];
	for (const record of records) {
		const bytes = new Uint8Array(await readFile(record.absolutePath));
		totalBytes += bytes.length;
		if (totalBytes > maximumBytes) {
			throw assetError("REBBE_ASSET_BYTE_LIMIT", `${totalBytes}:${maximumBytes}`);
		}
		entries.push([record.relativePath, bytes]);
	}
	return Object.freeze(Object.fromEntries(entries));
}

async function collectDirectory(root, current, output) {
	const entries = await readdir(current, { withFileTypes: true });
	entries.sort((left, right) => left.name.localeCompare(right.name));
	for (const entry of entries) {
		if (entry.name === "android" || entry.name.startsWith(".")) continue;
		const absolutePath = path.join(current, entry.name);
		if (entry.isSymbolicLink()) throw assetError("REBBE_ASSET_LINK", absolutePath);
		if (entry.isDirectory()) {
			await collectDirectory(root, absolutePath, output);
			continue;
		}
		if (!entry.isFile()) throw assetError("REBBE_ASSET_KIND", absolutePath);
		const relativePath = path.relative(root, absolutePath).split(path.sep).join("/");
		output.push(Object.freeze({ absolutePath, relativePath }));
	}
}

function boundedNumber(value, fallback, code) {
	const number = Number(value ?? fallback);
	if (!Number.isSafeInteger(number) || number < 1) throw assetError(code, value);
	return number;
}

function assetError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
