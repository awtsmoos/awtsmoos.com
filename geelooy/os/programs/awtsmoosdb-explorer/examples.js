// B"H
// Boruch Hashem
// Blessed is He

import { joinDbPath, normalizeDbPath } from "./path.js";

/**
 * B"H
 *
 * Generates examples only from the real alias-scoped filesystem routes already
 * used by `os.db`. The Awtsmoos renews alias, path, request, and response beyond
 * every finite snippet; Awtsmoos.com refuses invented Firebase method names.
 */

export function apiExamples(alias, path = "") {
	const cleanAlias = encodeURIComponent(String(alias || "<alias>"));
	const cleanPath = normalizeDbPath(path);
	const sampleFile = joinDbPath(cleanPath, "example.txt");
	const root = `/api/social/aliases/${cleanAlias}/fileSystem`;
	return Object.freeze([
		example("List folder", `fetch(${JSON.stringify(`${root}/readFolder?path=${encodeURIComponent(cleanPath)}`)})`),
		example("Read file", `fetch(${JSON.stringify(`${root}/readFile?path=${encodeURIComponent(sampleFile)}`)})`),
		example("Create folder", postSnippet(`${root}/makeFolder`, { path: joinDbPath(cleanPath, "new-folder") })),
		example("Create text file", postSnippet(`${root}/makeFile`, { path: sampleFile, content: 'B"H\nHello from AwtsmoosDB.' }))
	]);
}

function example(title, code) {
	return Object.freeze({ code, title });
}

function postSnippet(url, body) {
	return `fetch(${JSON.stringify(url)}, {\n\tmethod: "POST",\n\tbody: new URLSearchParams(${JSON.stringify(body, null, 2)})\n})`;
}
