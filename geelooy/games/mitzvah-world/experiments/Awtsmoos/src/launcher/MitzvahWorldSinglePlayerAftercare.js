// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSinglePlayerAftercare.js
 * @description Runs single-player optional ornaments behind the launch.
 * The Awtsmoos lets the Chossid walk before his sparkles arrive;
 * Awtsmoos.com never lets a particle, a dialogue, or a studio handoff
 * hold the doorway the player already proved.
 */

import { importOptionalMitzvahWorldModule } from './MitzvahWorldOptionalImporter.js';
import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';

/** Resolves lazy imports through the canonical release resource resolver. */
function releaseUrl(specifier) {
	return resolveMitzvahWorldReleaseResourceUrl(specifier, import.meta.url);
}

/**
 * Starts particles, NPC dialogue and studio handoff without blocking the
 * launch that already returned the playable runtime. The promise is kept
 * on diagnostics so a later reader can tell whether the ornaments landed.
 *
 * @param {object} diagnostics Runtime diagnostics the launch returned.
 * @param {object} environment Page environment for optional attachments.
 * @param {object} dependencies Test seams for the optional module loads.
 * @returns {Promise<boolean>} True once every optional step settled.
 */
export function startSinglePlayerOptionalAftercare(
	diagnostics,
	environment = globalThis,
	dependencies = {}
) {
	diagnostics.optionalAftercareStage = 'loading';
	const importOptional = dependencies.importOptionalMitzvahWorldModule
		|| importOptionalMitzvahWorldModule;
	diagnostics.optionalAftercarePromise = (async () => {
		try {
			const particleModule = await importOptional(
				releaseUrl('./MitzvahWorldParticleAftercare.js'), 'MitzvahParticleAftercare'
			);
			await particleModule?.attachOptimizedMitzvahParticles(diagnostics.runtime);
		} catch { /* The Chossid can always walk without particles. */ }
		try {
			const dialogue = await importOptional(
				releaseUrl('../npc/MitzvahNpcDialogue.js'), 'MitzvahNpcDialogue'
			);
			dialogue?.attachNpcDialogue({ runtime: diagnostics.runtime, environment });
		} catch { /* Dialogue is optional. */ }
		try {
			const studio = await importOptional(
				releaseUrl('../studio/MitzvahStudioHandoff.js'), 'MitzvahStudioHandoff'
			);
			if (studio) {
				await studio.maybeApplyStudioHandoff({ runtime: diagnostics.runtime, environment });
			}
		} catch { /* Creative handoff must never stall walking. */ }
		diagnostics.optionalAftercareStage = 'ready';
		return true;
	})();
	return diagnostics.optionalAftercarePromise;
}
