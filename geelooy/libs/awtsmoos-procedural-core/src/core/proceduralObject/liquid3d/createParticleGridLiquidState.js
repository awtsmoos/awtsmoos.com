// B"H
// Boruch Hashem
// Blessed is He
/** Particles and grid become one immutable liquid state beneath the Awtsmoos. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { createParticleSystem } from "../particles/createParticleSystem.js";
import { createScalarGrid3d, createVectorGrid3d } from "../volumes/grid3d.js";
import { clampLiquidBlend, createLiquidGridDeclaration } from "./liquidGridContract.js";

function vectorGrid(declaration, input = {}) {
	return createVectorGrid3d({
		...declaration,
		x: input.x,
		y: input.y,
		z: input.z
	});
}

export function createParticleGridLiquidState(input = {}) {
	const grid = createLiquidGridDeclaration(input);
	const particleSystem = createParticleSystem(input.particleSystem ?? {
		id: input.particleSystemId,
		capacity: input.capacity,
		seed: input.seed,
		particles: input.particles ?? []
	});
	const velocityGrid = vectorGrid(grid, input.velocityGrid);
	const previousVelocityGrid = vectorGrid(
		grid,
		input.previousVelocityGrid ?? velocityGrid
	);
	const massGrid = createScalarGrid3d({
		...grid,
		values: input.massGrid?.values
	});
	return Object.freeze({
		schema: "awtsmoos.particle-grid-liquid-state-3d",
		id: input.id ?? createStableId("liquid.state.3d", {
			particleSystemId: particleSystem.id,
			grid
		}),
		tick: Math.max(0, Math.floor(input.tick ?? 0)),
		time: Number(input.time ?? 0),
		grid,
		blend: clampLiquidBlend(input.blend),
		particleSystem,
		massGrid,
		velocityGrid,
		previousVelocityGrid,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}
