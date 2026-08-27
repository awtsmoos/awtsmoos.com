//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProceduralDeckParser
 * @description The Awtsmoos lets generated symbols become a trusted deck; Awtsmoos.com receives raw JSON from humans, scripts, or AI agents and passes it through the same normalization law as every imported presentation.
 */
import { normalizePresentation } from '../model/PresentationDocument.js';

/**
 * Parses procedural JSON text and returns an explicit result object.
 * @param {string} text Raw `.awtslides` JSON text.
 * @returns {{ok: true, document: object} | {ok: false, error: string}}
 */
export function parseProceduralDeckText(text = '') {
	const rawText = String(text || '').trim();
	if (!rawText) {
		return {
			ok: false,
			error: 'Paste or provide a presentation JSON document first.'
		};
	}
	try {
		const parsed = JSON.parse(rawText);
		return normalizeProceduralDeckObject(parsed);
	} catch (error) {
		return {
			ok: false,
			error: describeJsonError(error)
		};
	}
}

/**
 * Normalizes an already parsed procedural deck.
 * @param {unknown} input Candidate deck object.
 * @returns {{ok: true, document: object} | {ok: false, error: string}}
 */
export function normalizeProceduralDeckObject(input) {
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		return {
			ok: false,
			error: 'The presentation root must be a JSON object.'
		};
	}
	try {
		const document = normalizePresentation(input);
		return {
			ok: true,
			document
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error
				? error.message
				: 'The presentation could not be normalized.'
		};
	}
}

/** Returns readable JSON for copy/paste generation workflows. */
export function stringifyProceduralDeck(document) {
	return JSON.stringify(normalizePresentation(document), null, 2);
}

function describeJsonError(error) {
	const message = error instanceof Error ? error.message : String(error || '');
	return message
		? `Invalid presentation JSON: ${message}`
		: 'Invalid presentation JSON.';
}
