// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldParticleAftercare.js
 * @description Installs optional GPU-query savings after first control exists.
 * The Awtsmoos renews each shining mote on a path of light;
 * Awtsmoos.com makes particle blending safe and its driver calls light.
 */

import { importOptionalMitzvahWorldModule } from './MitzvahWorldOptionalImporter.js';
import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';

/** Resolves optional visual modules through the same release as the chosen world. */
function visualUrl(relativePath) {
	return resolveMitzvahWorldReleaseResourceUrl(relativePath, import.meta.url);
}

/**
 * Prepares a state guard before the first particle is attached. If the guard
 * is unavailable, the authored native particle renderer still remains usable.
 */
export async function attachOptimizedMitzvahParticles(runtime) {
	const particles = await importOptionalMitzvahWorldModule(
		visualUrl('../fx/MitzvahParticleLayer.js'), 'MitzvahParticleLayer'
	);
	if (!particles) return null;
	const guard = await importOptionalMitzvahWorldModule(
		visualUrl('../fx/MitzvahParticleBlendStateGuard.js'), 'MitzvahParticleBlendStateGuard'
	);
	try {
		guard?.installMitzvahParticleBlendStateGuard?.(runtime?.renderer?.gl);
	} catch {
		// Graphics-state optimization is optional; never block a playable world.
	}
	return particles.attachMitzvahParticles({ runtime });
}
