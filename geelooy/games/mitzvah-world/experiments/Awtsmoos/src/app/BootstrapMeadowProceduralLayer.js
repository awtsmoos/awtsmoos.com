// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMeadowProceduralLayer.js
 * @description Wires MitzvahWorld's meadow through the real procedural core:
 * instanced wind-swayed grass, dense ambient particle fields (fireflies, spores),
 * and real procedural trees with wind response. The Awtsmoos renews meadow, mote,
 * and tree through one doorway; Awtsmoos.com keeps every build step lazy, guarded,
 * and additive, so the meadow still boots in seconds and a vegetation failure can
 * never break the visible frame.
 */

import { createGrassFieldMesh } from '../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/grass/createGrassFieldMesh.js';
import { createMeadowGrassTints } from '../../../../../../libs/awtsmoos-procedural-core/src/core/webgl/grass/meadowGrassTints.js';
import {
	createMeadowGrassGlBinding,
	sampleMeadowGust
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/webgl/grass/MeadowGrassGlRenderer.js';
import { createFireflyParticleEffect } from '../../../../../../libs/awtsmoos-procedural-core/src/core/proceduralObject/particles/effects/presets/nature/createFireflyParticleEffect.js';
import { createSporeParticleEffect } from '../../../../../../libs/awtsmoos-procedural-core/src/core/proceduralObject/particles/effects/presets/nature/createSporeParticleEffect.js';
import { createEmberParticleEffect } from '../../../../../../libs/awtsmoos-procedural-core/src/core/proceduralObject/particles/effects/presets/nature/createEmberParticleEffect.js';
import { createMeadowAmbientParticleField } from '../../../../../../libs/awtsmoos-procedural-core/src/core/webgl/particles/MeadowAmbientParticleField.js';
import { createMeadowParticleGlBinding } from '../../../../../../libs/awtsmoos-procedural-core/src/core/webgl/particles/MeadowParticleGlRenderer.js';
import { createMeadowTreeGroup } from '../../../../../../libs/awtsmoos-procedural-core/src/adapters/native/meadowTreeFactory.js';
import { createMeadowTreeWindController } from '../../../../../../libs/awtsmoos-procedural-core/src/core/tzomayach/MeadowTreeWindController.js';
import { lookAt, perspective } from '../../../light-three-gltf/tiny-camera-math.js';

const GRASS_BOUNDS = Object.freeze({ minX: -105, maxX: 105, minZ: -60, maxZ: 170 });
const HOUSE_CLEARINGS = Object.freeze([
	{ x: 46, z: -60, radius: 15 },
	{ x: -80, z: -62, radius: 15 }
]);
const TREE_RING = Object.freeze([
	{ x: -88, z: -30, kind: 'olive' },
	{ x: -95, z: 20, kind: 'olive' },
	{ x: -88, z: 70, kind: 'oak' },
	{ x: -70, z: 110, kind: 'pine' },
	{ x: -30, z: 128, kind: 'olive' },
	{ x: 15, z: 132, kind: 'oak' },
	{ x: 58, z: 118, kind: 'olive' },
	{ x: 88, z: 90, kind: 'pine' },
	{ x: 95, z: 45, kind: 'olive' },
	{ x: 90, z: 0, kind: 'oak' },
	{ x: 70, z: -38, kind: 'olive' },
	{ x: 30, z: -48, kind: 'birch' },
	{ x: -15, z: -50, kind: 'olive' },
	{ x: -55, z: -45, kind: 'oak' }
]);
const PARTICLE_BOUNDS = Object.freeze({
	min: [-100, 0.4, -60],
	max: [100, 7, 170]
});
const WIND_DIRECTION = Object.freeze([0.8, 0.0, 0.35]);

/** Time-of-day visibility for each ambient field (dream references: fireflies rule the night). */
const FIELD_VISIBILITY = Object.freeze({
	fireflies: Object.freeze({ day: 0.16, sunrise: 0.85, night: 1.0 }),
	spores: Object.freeze({ day: 1.0, sunrise: 0.7, night: 0.12 }),
	embers: Object.freeze({ day: 0.7, sunrise: 1.0, night: 1.0 })
});

/**
 * Builds grass, trees, and ambient particle specs and stores them on the scene.
 * Idempotent per scene; never throws (returns null on failure so boot continues).
 */
export function attachMeadowProceduralLayer(scene, options = {}) {
	try {
		if (!scene || scene.userData?.meadowProceduralLayer) {
			return scene?.userData?.meadowProceduralLayer || null;
		}
		const seed = String(options.seed ?? 'meadow-procedural-v1');
		const grassCount = Math.max(0, Math.floor(options.grassCount ?? 6000));

		const fieldMesh = createGrassFieldMesh({
			seed: `${seed}-grass`,
			count: grassCount,
			bounds: GRASS_BOUNDS,
			heightAt: () => 0,
			blades: 7,
			minScale: 0.7,
			maxScale: 1.7
		});
		const filtered = filterGrassFieldMesh(fieldMesh, (x, z) => !insideClearing(x, z));
		const tints = createMeadowGrassTints(filtered, {
			seed: `${seed}-tints`,
			palette: options.grassPalette || 'dream-meadow'
		});

		const windController = createMeadowTreeWindController();
		const trees = [];
		const treeSpecs = options.trees ?? TREE_RING;
		for (const [index, spec] of treeSpecs.entries()) {
			try {
				const tree = createMeadowTreeGroup({
					kind: spec.kind || 'olive',
					seed: `${seed}-tree-${index}`,
					position: [spec.x, 0, spec.z]
				});
				markBootstrapVisible(tree);
				scene.add(tree);
				windController.registerTree(tree);
				trees.push(tree);
			} catch {}
		}

		const fields = [];
		fields.push(makeField('fireflies', createFireflyParticleEffect({
			id: `${seed}-fireflies`,
			count: options.fireflyCount ?? 1100,
			bounds: PARTICLE_BOUNDS
		})));
		fields.push(makeField('spores', createSporeParticleEffect({
			id: `${seed}-spores`,
			count: options.sporeCount ?? 520,
			bounds: PARTICLE_BOUNDS
		})));
		if (options.emberSource) {
			fields.push(makeField('embers', createEmberParticleEffect({
				id: `${seed}-embers`,
				count: options.emberCount ?? 260,
				bounds: emberBoundsNear(options.emberSource)
			})));
		}

		const layer = {
			seed,
			grass: { fieldMesh: filtered, tints },
			trees,
			windController,
			fields: fields.filter(Boolean),
			gl: null,
			glFailed: false,
			lastTimeSeconds: null
		};
		scene.userData.meadowProceduralLayer = layer;
		return layer;
	} catch {
		return null;
	}
}

/**
 * Renders the procedural layer. Lazily compiles GL on first call; every failure
 * path is swallowed so the frame the sibling renderer owns can never break.
 */
export function renderMeadowProceduralLayer(gl, scene, camera, projectionView, skyEnv, stats) {
	const layer = scene?.userData?.meadowProceduralLayer;
	if (!layer || !gl || layer.glFailed) return;
	try {
		if (!layer.gl) {
			layer.gl = initLayerGl(gl, layer);
			if (!layer.gl) {
				layer.glFailed = true;
				return;
			}
		}
		const timeOfDay = skyEnv?.timeOfDay === 'night' || skyEnv?.timeOfDay === 'sunrise'
			? skyEnv.timeOfDay
			: 'day';
		const timeSeconds = Number(skyEnv?.timeSeconds) || 0;
		const delta = layer.lastTimeSeconds == null
			? 0.016
			: Math.min(0.1, Math.max(0.001, timeSeconds - layer.lastTimeSeconds));
		layer.lastTimeSeconds = timeSeconds;

		const gust = sampleMeadowGust(timeSeconds);
		const wind = {
			direction: WIND_DIRECTION,
			baseStrength: 0.5,
			turbulence: 0.7,
			wetness: 0,
			recovery: 0.85
		};
		layer.windController.update(timeSeconds, { direction: WIND_DIRECTION, strength: 0.6 * gust });
		try {
			scene.updateWorldMatrix?.();
		} catch {}

		const matrices = cameraMatrices(camera);
		if (matrices && layer.gl.grass) {
			layer.gl.grass.render({
				projectionMatrix: matrices.projection,
				viewMatrix: matrices.view,
				timeSeconds,
				wind,
				gustScale: 1,
				timeOfDay,
				interactors: readInteractors(scene)
			});
			if (stats) stats.draws += 1;
		}

		const windVector = [WIND_DIRECTION[0] * 0.6 * gust, 0, WIND_DIRECTION[2] * 0.6 * gust];
		for (const field of layer.fields) {
			try {
				field.field.update(delta, { time: timeSeconds, wind: windVector, gustScale: gust });
				const packed = field.field.pack(timeSeconds);
				const visibility = (FIELD_VISIBILITY[field.name] || {} )[timeOfDay] ?? 1;
				if (visibility <= 0.01) continue;
				field.binding.render(packed, projectionView, {
					additive: field.additive,
					sizeScale: 950,
					globalAlpha: visibility
				});
				if (stats) stats.draws += 1;
			} catch {}
		}
	} catch {
		layer.glFailed = true;
	}
}

/** Releases GL resources owned by the layer. */
export function disposeMeadowProceduralLayer(scene) {
	const layer = scene?.userData?.meadowProceduralLayer;
	if (!layer) return;
	try {
		layer.gl?.grass?.dispose?.();
		for (const field of layer.fields) {
			try { field.binding?.dispose?.(); } catch {}
		}
	} catch {}
	layer.gl = null;
	layer.glFailed = true;
}

function makeField(name, recipe) {
	const field = createMeadowAmbientParticleField(recipe);
	if (!field) return null;
	return {
		name,
		field,
		additive: recipe.meadowField.additive !== false,
		binding: null
	};
}

function initLayerGl(gl, layer) {
	const grass = createMeadowGrassGlBinding(gl, layer.grass.fieldMesh, { tints: layer.grass.tints });
	const handles = { grass };
	for (const field of layer.fields) {
		try {
			field.binding = createMeadowParticleGlBinding(gl, field.field.count);
		} catch {
			field.binding = null;
		}
	}
	layer.fields = layer.fields.filter(field => field.binding);
	return handles;
}

function cameraMatrices(camera) {
	try {
		if (!camera?.position) return null;
		const position = typeof camera.position.toArray === 'function'
			? camera.position.toArray()
			: [camera.position.x || 0, camera.position.y || 0, camera.position.z || 0];
		const target = camera.target || [0, 1, 0];
		return {
			projection: perspective(camera.fov || 60, camera.aspect || 1.78, camera.near || 0.1, camera.far || 1000),
			view: lookAt(position, Array.isArray(target) ? target : [target.x || 0, target.y || 1, target.z || 0])
		};
	} catch {
		return null;
	}
}

function readInteractors(scene) {
	const point = scene?.userData?.meadowPlayerPosition;
	if (!point) return [];
	return [{ x: Number(point.x) || 0, y: Number(point.y) || 0, z: Number(point.z) || 0, radius: 1.4 }];
}

function insideClearing(x, z) {
	for (const clearing of HOUSE_CLEARINGS) {
		const dx = x - clearing.x;
		const dz = z - clearing.z;
		if (dx * dx + dz * dz < clearing.radius * clearing.radius) return true;
	}
	return false;
}

/** Returns a filtered copy of a grass field mesh (positions + all instance arrays). */
function filterGrassFieldMesh(fieldMesh, keep) {
	const count = fieldMesh?.instanceCount ?? 0;
	const kept = [];
	for (let index = 0; index < count; index += 1) {
		const x = fieldMesh.instanceOffsets[index * 3];
		const z = fieldMesh.instanceOffsets[index * 3 + 2];
		if (keep(x, z)) kept.push(index);
	}
	if (kept.length === count) return fieldMesh;
	const pick = (array, size) => {
		const out = new Float32Array(kept.length * size);
		for (let n = 0; n < kept.length; n += 1) {
			for (let c = 0; c < size; c += 1) out[n * size + c] = array[kept[n] * size + c];
		}
		return out;
	};
	return Object.freeze({
		...fieldMesh,
		instanceOffsets: pick(fieldMesh.instanceOffsets, 3),
		instanceScales: pick(fieldMesh.instanceScales, 1),
		instanceRotations: pick(fieldMesh.instanceRotations, 1),
		instanceBends: pick(fieldMesh.instanceBends, 1),
		instanceWindPhases: pick(fieldMesh.instanceWindPhases, 1),
		instanceCount: kept.length
	});
}

/** Marks every mesh under a tree group visible to the bootstrap color renderer. */
function markBootstrapVisible(group) {
	group.traverse?.(object => {
		if (object?.isMesh) {
			object.userData = { ...(object.userData || {}), bootstrapVisual: true };
		}
	});
}

function emberBoundsNear(source) {
	const x = Number(source?.x) || 0;
	const y = Number(source?.y) || 0.5;
	const z = Number(source?.z) || 0;
	return { min: [x - 3, y, z - 3], max: [x + 3, y + 7, z + 3] };
}
