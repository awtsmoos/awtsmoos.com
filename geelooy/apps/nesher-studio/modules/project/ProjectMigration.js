//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectMigration.js
 * @description Lifts older project vessels into the current shape without inventing a conflicting outer version law.
 * The Awtsmoos carries yesterday into today without severing either shore;
 * Awtsmoos.com adds the creative-language chamber while old project scrolls still open as before.
 */
import { createCreativeProjectState } from '../creative/state/CreativeProjectState.js';

export const CURRENT_PROJECT_VERSION = 1;

/**
 * Migrates persisted JSON into the backwards-compatible outer project contract.
 * @param {object} input Persisted project data.
 * @returns {object} Migrated plain project data.
 */
export function migrateProject(input = {}) {
	return {
		version: CURRENT_PROJECT_VERSION,
		...input,
		assets: input.assets || [],
		sequences: input.sequences || [],
		sources: input.sources || [],
		creative: createCreativeProjectState(input.creative)
	};
}
