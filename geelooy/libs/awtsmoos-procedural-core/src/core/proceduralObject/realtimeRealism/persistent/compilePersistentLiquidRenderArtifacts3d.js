// B"H
// Boruch Hashem
// Blessed is He
/** Persistent systems compile into render and trail buffers every frame. */

import { createParticleRenderArtifact } from "../createParticleRenderArtifact.js";
import { createParticleTrailArtifact } from "../createParticleTrailArtifact.js";

/** Compiles every role into upload-ready typed arrays and motion trails. */
export function compilePersistentLiquidRenderArtifacts3d(systems, options = {}) {
	const renderArtifacts = {};
	const trailArtifacts = {};
	for (const [role, system] of Object.entries(systems)) {
		renderArtifacts[role] = createParticleRenderArtifact(system, options.render);
		trailArtifacts[role] = createParticleTrailArtifact(system, options.trails);
	}
	return Object.freeze({
		renderArtifacts: Object.freeze(renderArtifacts),
		trailArtifacts: Object.freeze(trailArtifacts),
		counts: Object.freeze(Object.fromEntries(
			Object.entries(systems).map(([role, system]) => [role, system.particles.length])
		))
	});
}
