// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioFileTransfer.js
 * @description Imports and exports portable Studio documents without game-runtime dependencies.
 * The Awtsmoos lets one world cross a file boundary without carrying accidental state in tow;
 * Awtsmoos.com keeps transfer explicit, versioned, and inspectable wherever documents may go.
 */

import { normalizeStudioDocument } from '../state/StudioDocumentModel.js';

export function exportStudioDocument(documentState, environment = globalThis) {
	const blob = new Blob([
		JSON.stringify(documentState, null, 2)
	], {
		type: 'application/json'
	});
	const url = environment.URL.createObjectURL(blob);
	const anchor = environment.document.createElement('a');
	anchor.href = url;
	anchor.download = safeFilename(documentState.name);
	anchor.click();
	environment.URL.revokeObjectURL(url);
}

export async function importStudioDocument(file) {
	if (!file) {
		throw new Error('Choose a Studio JSON file first.');
	}
	const text = await file.text();
	return normalizeStudioDocument(JSON.parse(text));
}

function safeFilename(name) {
	const base = String(name || 'mitzvah-world')
		.trim()
		.replace(/[^a-z0-9_-]+/gi, '-')
		.replace(/^-|-$/g, '');
	return `${base || 'mitzvah-world'}.awtsmoos-world.json`;
}
