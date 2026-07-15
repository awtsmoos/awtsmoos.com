// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file css-graph.mjs
 * @description
 * The Awtsmoos threads one visible garment through many CSS vessels. This
 * Awtsmoos.com graph follows every live import and names broken boundaries.
 */

import fs from "node:fs/promises";
import path from "node:path";

function removeQuery(value) {
	return value.split(/[?#]/)[0];
}

function resolveWebPath(reference, ownerFile, geelooyRoot) {
	const cleanReference = removeQuery(reference);
	if (!cleanReference || /^(?:https?:|data:|blob:|\/\/)/.test(cleanReference)) {
		return null;
	}
	if (cleanReference.startsWith("/")) {
		return path.join(geelooyRoot, cleanReference.slice(1));
	}
	return path.resolve(path.dirname(ownerFile), cleanReference);
}

async function fileExists(filePath) {
	try {
		return (await fs.stat(filePath)).isFile();
	} catch {
		return false;
	}
}

/**
 * Follows one stylesheet and every transitive import.
 * @param {string} entryFile Resolved entry stylesheet.
 * @param {string} geelooyRoot Geelooy filesystem root.
 * @returns {Promise<object>} Imported files, edges, and broken paths.
 */
export async function buildCssGraph(entryFile, geelooyRoot) {
	const files = [];
	const edges = [];
	const broken = [];
	const visiting = new Set();

	async function visit(filePath) {
		const normalized = path.normalize(filePath);
		if (visiting.has(normalized)) {
			return;
		}
		visiting.add(normalized);
		if (!await fileExists(normalized)) {
			broken.push(normalized);
			return;
		}
		files.push(normalized);
		const source = await fs.readFile(normalized, "utf8");
		const imports = [...source.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)["']\s*\)?[^;]*;/gi)];
		for (const match of imports) {
			const resolved = resolveWebPath(match[1], normalized, geelooyRoot);
			if (!resolved) {
				continue;
			}
			edges.push({ from: normalized, reference: match[1], to: resolved });
			await visit(resolved);
		}
	}

	await visit(entryFile);
	return {
		entry: entryFile,
		files: [...new Set(files)],
		edges,
		broken: [...new Set(broken)]
	};
}

/**
 * Resolves an HTML stylesheet href into the Geelooy filesystem.
 * @param {string} href Browser stylesheet URL.
 * @param {string} htmlFile HTML owner file.
 * @param {string} geelooyRoot Geelooy filesystem root.
 * @returns {string|null} Resolved path or null for remote resources.
 */
export function resolveHtmlStylesheet(href, htmlFile, geelooyRoot) {
	return resolveWebPath(href, htmlFile, geelooyRoot);
}
