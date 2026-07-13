// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseDefinitionAssembly.js
 * @description Separates exterior permanence from interior revelation so each
 * closed dwelling can conceal unseen vessels before the all-seeing Awtsmoos.
 */
import { createYardGrassDefinition } from '../grass/YardGrassGeometry.js';
import { createFenceAlongPath } from '../ProceduralFenceSystem.js';
import { createStoryFloorPieces } from '../StoryFloorSystem.js';
import { tagHouseInteriorDefinitions } from '../visibility/HouseVisibilityMetadata.js';
import {
	createHouseFenceSegments,
	createHouseYardPatches
} from './HouseFenceSystem.js';
import { createHouseShell } from './HouseShellSystem.js';
import { planHouseStaircase } from './HouseStairSystem.js';
import { createStairDefinitions } from './StairMeshBuilder.js';

/** Builds classified static definitions and preserves measured support evidence. */
export function assembleHouseDefinitions({
	spec,
	materials,
	entry,
	rooms,
	groundSampler
}) {
	const stairLayouts = [];
	const yardPatches = spec.fence ? createHouseYardPatches(spec) : [];
	const yardGrass = createYardGrass(spec, yardPatches, groundSampler);
	const definitions = [
		...createHouseShell(spec, materials),
		entry.wall,
		entry.mezuza,
		...entry.steps,
		...tagHouseInteriorDefinitions(rooms.staticDefs, spec.id, 'room-partitions')
	];
	for (let level = 1; level < spec.floors; level += 1) {
		appendStory(definitions, stairLayouts, spec, materials, level);
	}
	if (yardGrass) {
		definitions.push(yardGrass);
	}
	definitions.push(...createFenceDefinitions(spec, materials, groundSampler));
	return {
		definitions,
		stairLayouts,
		yardGrass,
		yardPatches
	};
}

function appendStory(definitions, stairLayouts, spec, materials, level) {
	const layout = planHouseStaircase(spec, level - 1, level);
	stairLayouts.push(layout);
	definitions.push(...tagHouseInteriorDefinitions(
		createStoryFloorPieces({ spec, material: materials.stone, level }),
		spec.id,
		`story-${level + 1}-floor`
	));
	definitions.push(...tagHouseInteriorDefinitions(
		createStairDefinitions(layout, spec, materials.stone),
		spec.id,
		`stairs-${level}-${level + 1}`
	));
}

function createYardGrass(spec, yardPatches, groundSampler) {
	return groundSampler && yardPatches.length
		? createYardGrassDefinition(spec, yardPatches, groundSampler)
		: null;
}

function createFenceDefinitions(spec, materials, groundSampler) {
	if (!spec.fence || !groundSampler) {
		return [];
	}
	return createFenceAlongPath({
		id: `${spec.id}-measured-fence`,
		segments: createHouseFenceSegments(spec),
		groundSampler,
		material: {
			...materials.fence,
			doubleSided: true
		}
	});
}
