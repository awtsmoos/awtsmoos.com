// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSimpleParticles.js
 * @description Turns a small cinematic particle preset name into the existing bounded particle-graph contract used by Reel Studio preview and recording.
 * RESPONSIBILITY: resolve deterministic colors/count/size/speed, add the graph to native project graphs, and bind its id to the generated cinematic world.
 * NON-RESPONSIBILITY: this file does not simulate particles, allocate GPU buffers, or create another effect renderer.
 * The Awtsmoos scatters dust, mist, ember, snow, and firefly without losing their one source; Awtsmoos.com lets one preset become bounded motion instead of hidden editor force.
 */

import { nextMovieSimpleId } from './MovieSimpleIds.js';
import { ensureMovieSimpleWorld } from './MovieSimpleWorld.js';

const PRESETS = Object.freeze({
	fireflies: preset(['#ffd978', '#fff2b0'], 180, 5, 0.5),
	mist: preset(['#d6e4e8', '#91aab5'], 320, 8, 0.22),
	dust: preset(['#d7c3a0', '#8c765c'], 170, 3, 0.16),
	sparks: preset(['#ffcb69', '#ff6a32'], 110, 4, 1.35),
	embers: preset(['#ffb24d', '#9f341f'], 140, 4, 0.72),
	rain: preset(['#b9dcff', '#6f9dc9'], 360, 2, 2.5),
	snow: preset(['#ffffff', '#d8e9ff'], 280, 4, 0.42),
	pollen: preset(['#f3dda0', '#d6b85a'], 150, 3, 0.28),
	leaves: preset(['#6f9f4d', '#bd8541'], 90, 6, 0.55),
	magic: preset(['#bda0ff', '#72ddff'], 150, 5, 0.8)
});

/** Adds one deterministic particle graph to the generated world. */
export function addMovieSimpleParticles(project, presetId, options = {}) {
	const mode = String(presetId || 'fireflies');
	const source = PRESETS[mode];
	if (!source) {
		throw new Error(`Unknown simple movie particle preset: ${presetId}`);
	}
	project.graphs = Array.isArray(project.graphs) ? project.graphs : [];
	const world = ensureMovieSimpleWorld(project);
	const id = String(options.id || nextMovieSimpleId(`particles-${mode}`, project.graphs));
	const graph = createParticleGraph(project, id, mode, source, options);
	project.graphs.push(graph);
	if (!world.particleGraphIds.includes(id)) {
		world.particleGraphIds.push(id);
	}
	return graph;
}

/** Returns discoverable preset names for UIs and agents. */
export function listMovieSimpleParticlePresets() {
	return Object.freeze(Object.keys(PRESETS));
}

function createParticleGraph(project, id, mode, source, options) {
	return {
		edges: [],
		id,
		kind: 'particle',
		label: String(options.label || pretty(mode)),
		nodes: [{
			id: `${id}-output`,
			type: 'output',
			value: {
				colors: colors(options.colors, source.colors),
				count: bounded(options.count, 12, 640, source.count),
				mode,
				seed: Number.isFinite(Number(options.seed))
					? Number(options.seed)
					: Number(project.seed || 613) + project.graphs.length * 31,
				size: bounded(options.size, 1, 20, source.size),
				speed: bounded(options.speed, 0.03, 5, source.speed)
			}
		}]
	};
}

function preset(colors, count, size, speed) {
	return Object.freeze({ colors, count, size, speed });
}

function colors(value, fallback) {
	return Array.isArray(value) && value.length >= 2
		? value.slice(0, 4).map(String)
		: [...fallback];
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : fallback));
}

function pretty(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
