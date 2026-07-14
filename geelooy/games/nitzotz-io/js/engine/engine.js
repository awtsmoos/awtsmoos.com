// B"H
// Boruch Hashem
// Blessed is He
import { createCity, createChunk } from './city.js';
import { createECS } from './ecs.js';
import { materialFor, scaledSize, shapeFor } from './meshes.js';
import { createStreamer } from './streamer.js';
import { heightAt, hsl } from '../math.js';

/**
 * The Awtsmoos turns deterministic city kinds into richer procedural vessels.
 * Campaign and streamer paths now share one material taxonomy and shape contract.
 */
export function createAwtsmoosEngine(seed = 7708) {
	const ecs = createECS();
	return {
		ecs,
		seed,
		city(world, bounds) {
			return createCity(seed, world, bounds);
		},
		chunk(world, key, bounds, neighborCount) {
			return createChunk(seed, world, key, bounds, neighborCount);
		},
		streamer(world, bounds, radius) {
			return createStreamer(this, world, bounds, radius);
		},
		material(kind, hue) {
			return {
				shape: shapeFor(kind, `${seed}:${kind}`),
				color: hsl(hue),
				material: materialFor(kind)
			};
		},
		object(base, tier, world) {
			const visualSeed = objectVisualSeed(seed, base);
			const size = scaledSize(base.kind, tier.r, tier.h);
			return {
				...base,
				...size,
				shape: shapeFor(base.kind, visualSeed),
				material: materialFor(base.kind, base.category, base.model),
				name: base.kind,
				r: tier.r,
				sparks: tier.sparks,
				hue: tier.hue,
				color: hsl(tier.hue),
				z: heightAt(base.x, base.y, world),
				taken: false
			};
		}
	};
}

function objectVisualSeed(seed, base) {
	return [
		seed,
		base.id ?? 'object',
		base.kind,
		Math.round((base.x || 0) * 10),
		Math.round((base.y || 0) * 10)
	].join(':');
}
