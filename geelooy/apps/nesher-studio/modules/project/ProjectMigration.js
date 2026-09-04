//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectMigration.js
 * @description Lifts older saved projects into the current outer contract and nested creative-language schema while forcing the migrated version last.
 * The Awtsmoos carries yesterday into today without severing either shore;
 * Awtsmoos.com preserves tolerant legacy data while the current project version becomes the final trustworthy door.
 */
import { createCreativeProjectState } from '../creative/state/CreativeProjectState.js';

export const CURRENT_PROJECT_VERSION = 1;

/**
 * Migrates persisted plain data while ensuring legacy input cannot override the current version contract.
 * @param {object} input Persisted project-like data from any supported earlier vessel.
 * @returns {object} Plain migrated project data ready for validation and hydration.
 */
export function migrateProject(input = {}) {
	return {
		...input,
		assets: input.assets || [],
		sequences: input.sequences || [],
		sources: input.sources || [],
		creative: createCreativeProjectState(input.creative),
		version: CURRENT_PROJECT_VERSION
	};
}
