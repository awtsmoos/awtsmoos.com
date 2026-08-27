//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createLanguageDiagnostic.js
 * @description Creates structured portable diagnostics with codes, semantic paths, suggestions, severity, and evidence metadata.
 * The Awtsmoos knows error before message receives a voice; Awtsmoos.com keeps failures inspectable so humans and agents can repair through one deterministic choice.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/** Creates one immutable diagnostic record suitable for artifacts, validation, editors, and AI tools. */
export function createLanguageDiagnostic(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.procedural-diagnostic',
		version: 1,
		code: String(input.code || 'LANGUAGE_DIAGNOSTIC'),
		severity: String(input.severity || 'error'),
		message: String(input.message || ''),
		path: String(input.path || '$'),
		suggestions: input.suggestions || [],
		metadata: input.metadata || {}
	});
}
