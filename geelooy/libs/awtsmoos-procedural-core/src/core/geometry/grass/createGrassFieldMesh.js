// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets old grass callers keep their trusted mesh arrays while deeper ecology grows behind the same door.
 * Awtsmoos.com joins curved tuft geometry, deterministic patches, wind phases, habitat evidence, and instancing in one field score.
 */

import { createGrassBladeGeometry } from "./grassBladeGeometry.js";
import { createGrassEcologyReport } from "./grassEcology.js";
import { planGrassPlacements } from "./grassPlacement.js";
import { createGrassRandom, normalizeGrassSeed } from "./grassRandom.js";

const FULL_TURN = Math.PI * 2;

function patchPoint(random, patches) {
	const patch = patches[Math.min(patches.length - 1, Math.floor(random.next() * patches.length))];
	const radius = Math.max(0, Number(patch?.[3] ?? 0)) * Math.sqrt(random.next());
	const angle = random.range(0, FULL_TURN);
	return {
		x: Number(patch?.[0] ?? 0) + Math.cos(angle) * radius,
		z: Number(patch?.[2] ?? 0) + Math.sin(angle) * radius
	};
}

function planPatchPlacements(input, seed) {
	const random = createGrassRandom(seed);
	const count = Math.max(0, Math.floor(input.count ?? 1000));
	const placements = [];
	for (let attempt = 0; attempt < count * 20 && placements.length < count; attempt += 1) {
		const point = patchPoint(random, input.patches);
		const ecology = createGrassEcologyReport({
			point,
			environment: input.environmentAt?.(point) ?? {},
			exclusions: input.exclusions,
			preferences: input.preferences,
			baseDensity: input.baseDensity,
			minimumScore: input.minimumHabitatScore
		});
		if (!ecology.accepted || random.next() > ecology.density) continue;
		placements.push(Object.freeze({
			position: Object.freeze({ ...point, y: Number(input.heightAt?.(point) ?? 0) }),
			yaw: random.range(0, FULL_TURN),
			scale: random.range(Number(input.minScale ?? 0.72), Number(input.maxScale ?? 1.6)),
			lean: random.range(Number(input.minLean ?? 0.4), Number(input.maxLean ?? 1.3)),
			windPhase: random.range(0, FULL_TURN),
			profile: "legacy-patch",
			habitatScore: ecology.habitatScore
		}));
	}
	return Object.freeze({ seed, placements: Object.freeze(placements) });
}

function typedInstances(placements) {
	const offsets = [];
	const scales = [];
	const rotations = [];
	const bends = [];
	const windPhases = [];
	for (const placement of placements) {
		offsets.push(placement.position.x, placement.position.y, placement.position.z);
		scales.push(placement.scale);
		rotations.push(placement.yaw);
		bends.push(placement.lean);
		windPhases.push(placement.windPhase);
	}
	return { offsets, scales, rotations, bends, windPhases };
}

/** Creates a legacy-compatible, deterministic, ecology-aware grass field mesh artifact. */
export function createGrassFieldMesh(input = {}) {
	const seed = normalizeGrassSeed(input.seed ?? 777);
	const geometry = createGrassBladeGeometry({ ...input, seed, blades: input.blades ?? 7 });
	const plan = input.patches?.length
		? planPatchPlacements(input, seed)
		: planGrassPlacements({
			...input,
			seed,
			count: input.count ?? 1000,
			bounds: input.bounds ?? {
				minX: -Number(input.width ?? 20) / 2,
				maxX: Number(input.width ?? 20) / 2,
				minZ: -Number(input.width ?? 20) / 2,
				maxZ: Number(input.width ?? 20) / 2
			}
		});
	const instances = typedInstances(plan.placements);
	return Object.freeze({
		...geometry,
		instanceOffsets: new Float32Array(instances.offsets),
		instanceScales: new Float32Array(instances.scales),
		instanceRotations: new Float32Array(instances.rotations),
		instanceBends: new Float32Array(instances.bends),
		instanceWindPhases: new Float32Array(instances.windPhases),
		instanceCount: plan.placements.length,
		drawMode: "TRIANGLES",
		schema: "awtsmoos.grass-field-mesh",
		placements: plan.placements,
		capabilities: Object.freeze({ ecology: true, instancing: true, wind: true, interactionReady: true, lodReady: true })
	});
}
