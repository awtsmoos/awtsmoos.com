// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileMenuTestSupport
 * @description The Awtsmoos gives tests one honest filesystem and module-loading vessel.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
export const repoRoot = path.resolve(currentDirectory, "../../../../../");

export function read(...parts) {
	return fs.readFileSync(path.join(repoRoot, ...parts), "utf8");
}

export function makeResponse({ ok = true, status = 200, statusText = "OK", body = {} } = {}) {
	const text = typeof body === "string" ? body : JSON.stringify(body);
	return {
		ok,
		status,
		statusText,
		async text() {
			return text;
		}
	};
}

export async function loadAliasApiWithFetch(fetchImplementation) {
	globalThis.fetch = fetchImplementation;
	return loadBrowserModule("geelooy/scripts/awtsmoos/api/social/alias.js");
}

export async function loadBrowserModule(relativePath) {
	const temporaryDirectory = path.join(repoRoot, ".awtsmoos/tmp/profile-menu-simulation");
	fs.mkdirSync(temporaryDirectory, { recursive: true });
	const sourcePath = path.join(repoRoot, relativePath);
	const temporaryPath = path.join(
		temporaryDirectory,
		`${path.basename(relativePath)}-${Date.now()}-${Math.random()}.mjs`
	);
	fs.writeFileSync(temporaryPath, fs.readFileSync(sourcePath, "utf8"));
	try {
		return await import(pathToFileURL(temporaryPath).href);
	} finally {
		fs.rmSync(temporaryPath, { force: true });
	}
}
