// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleMovieActionMutations
 * @description
 * Village, actor, camera, and graph mutations remain small, deterministic, and
 * undoable while preserving the complete canonical project around them.
 */

import {
	createMaterialGraph,
	createParticleGraph,
	createShaderGraph
} from './NleCinematicGraphFactory.js';
import {
	createTreeGrove,
	createVillageHouse
} from './NleCinematicVillageLayout.js';

export function addHouse(project, values) {
	const world = worldOf(project);
	const index = world.houses.length;
	world.houses.push(createVillageHouse({ ...values, id: `house-api-${index + 1}`, index }));
	return { houses: world.houses.length };
}

export function addTreeGrove(project, values) {
	const world = worldOf(project);
	const seed = Number(project.seed || 613) + world.trees.length + 1;
	world.trees.push(...createTreeGrove({ ...values, seed }));
	return { trees: world.trees.length };
}

export function addCharacterWalk(project, values) {
	const track = trackOf(project, 'actor', 'hero-performance');
	const id = `api-walk-${track.clips.length + 1}`;
	track.clips.push({
		action: 'move', animation: 'walk', duration: number(values.duration, 5), easing: 'smootherstep', id,
		from: { x: number(values.fromX), z: number(values.fromZ) }, start: number(values.start),
		to: { x: number(values.toX), z: number(values.toZ) }
	});
	worldOf(project).character.path.push({ t: 1, x: number(values.toX), z: number(values.toZ) });
	return { clipId: id };
}

export function addCameraShot(project, values) {
	const track = trackOf(project, 'camera', 'camera-cuts');
	const id = `api-shot-${track.clips.length + 1}`;
	track.clips.push({
		anchor: { x: number(values.anchorX), y: 0, z: number(values.anchorZ) },
		duration: number(values.duration, 4), id, rig: String(values.rig || 'dollyIn'),
		start: number(values.start), targetActor: 'player'
	});
	return { clipId: id, rig: values.rig };
}

export function addMaterial(project, values) {
	const index = project.materialGraphs.length + 1;
	const id = `material-api-${index}`;
	project.materialGraphs.push(createMaterialGraph({ color: values.color, id, label: values.label, roughness: number(values.roughness, .65) }));
	return { graphId: id };
}

export function addShader(project, values) {
	const index = project.graphs.length + 1;
	const id = `shader-api-${index}`;
	project.graphs.push(createShaderGraph({ id, label: values.label, seed: Number(project.seed || 613) + index }));
	return { graphId: id };
}

export function addParticles(project, values) {
	const index = project.graphs.length + 1;
	const id = `particles-api-${index}`;
	project.graphs.push(createParticleGraph({ count: number(values.count, 260), id, label: values.label, mode: values.mode, seed: Number(project.seed || 613) + index }));
	worldAsset(project).particleGraphIds.push(id);
	return { graphId: id };
}

export function worldAsset(project) {
	const asset = project.nle?.assets?.find(item => item.kind === 'cinematic-world');
	if (!asset) throw new Error('Load the cinematic village before editing its world.');
	return asset;
}

function worldOf(project) { return worldAsset(project).world; }
function trackOf(project, type, id) {
	let track = project.tracks.find(item => item.type === type);
	if (!track) { track = { clips: [], id, type }; project.tracks.push(track); }
	return track;
}
function number(value, fallback = 0) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
