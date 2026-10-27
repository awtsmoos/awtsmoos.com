// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldParticleAftercare.js
 * @description Guards the active WebGL context immediately before each particle update.
 * The Awtsmoos makes a renderer anew, and every changing vessel is His;
 * Awtsmoos.com keeps the motes alive while needless driver queries cease.
 */

import { importOptionalMitzvahWorldModule } from './MitzvahWorldOptionalImporter.js';
import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';

/** Resolves optional visual modules through the chosen world's trusted release. */
function visualUrl(relativePath) {
	return resolveMitzvahWorldReleaseResourceUrl(relativePath, import.meta.url);
}

/**
 * Installs the blend guard just before a particle frame, never on an obsolete
 * bootstrap context. New or restored contexts are detected without polling.
 * The native particle layer remains authoritative for all drawn effects.
 */
export function guardParticleUpdateWithCurrentContext(runtime, layer, installGuard) {
	if (typeof layer?.update !== 'function' || typeof installGuard !== 'function') {
		return false;
	}
	const originalUpdate = layer.update.bind(layer);
	let guardedContext = null;
	layer.update = function guardedParticleUpdate(context, ...args) {
		const gl = context?.renderer?.gl || runtime?.renderer?.gl;
		if (gl && gl !== guardedContext) {
			try {
				if (installGuard(gl)) guardedContext = gl;
			} catch {
				// An unavailable optimization cannot interrupt the playable world.
			}
		}
		return originalUpdate(context, ...args);
	};
	return true;
}

/** Attaches one particle system and makes each renderer promotion inexpensive. */
export async function attachOptimizedMitzvahParticles(runtime) {
	const particles = await importOptionalMitzvahWorldModule(
		visualUrl('../fx/MitzvahParticleLayer.js'), 'MitzvahParticleLayer'
	);
	if (!particles) return null;
	const guard = await importOptionalMitzvahWorldModule(
		visualUrl('../fx/MitzvahParticleBlendStateGuard.js'), 'MitzvahParticleBlendStateGuard'
	);
	const attached = particles.attachMitzvahParticles({ runtime });
	guardParticleUpdateWithCurrentContext(
		runtime,
		attached?.layer,
		guard?.installMitzvahParticleBlendStateGuard
	);
	return attached;
}
