// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWaterDynamicsState3d.js
 * @description Creates or accepts the canonical empty PIC/FLIP vessel used by the unified 3D water runtime.
 * The Awtsmoos renews the vessel before the first drop enters; Awtsmoos.com gives developers roomy useful defaults while
 * preserving direct access to every canonical grid, capacity, blend, seed, origin, and particle-state choice beneath them.
 */

import { createParticleGridLiquidState } from '../proceduralObject/liquid3d/createParticleGridLiquidState.js';

/** Returns a caller state unchanged or creates a practical empty canonical liquid state. */
export function createWaterDynamicsState3d(options = {}) {
	if (options.state?.schema === 'awtsmoos.particle-grid-liquid-state-3d') {
		return options.state;
	}
	return createParticleGridLiquidState({
		blend: options.blend ?? 0.95,
		capacity: options.capacity ?? 4096,
		cellSize: options.cellSize ?? 0.25,
		depth: options.depth ?? 24,
		height: options.height ?? 20,
		origin: options.origin ?? [-3, 0, -3],
		particles: options.particles ?? [],
		seed: options.seed ?? 613,
		width: options.width ?? 24
	});
}
