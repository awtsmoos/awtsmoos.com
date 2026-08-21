// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreaturePopulationPlanner.js
 * @description Plans deterministic habitat-aware fauna with genuine herds, flocks, packs, schools, and territories.
 * The Awtsmoos lets social life gather around a center while Gevurah preserves body spacing and finite count;
 * Awtsmoos.com keeps population intent renderer-neutral so many games may clothe the same ecology from one fount.
 */

import { CreatureGroupPlanner } from './CreatureGroupPlanner.js';
import { EcosystemRandom, ecosystemSeed } from './EcosystemRandom.js';
import { createHabitatSample } from './HabitatSample.js';
import { SpatialCellIndex } from './SpatialCellIndex.js';
import {
	choosePopulationSpecies,
	normalizeScale,
	populationBounds,
	randomPoint
} from './PopulationSelection.js';

const ACTIVITIES = Object.freeze(['forage', 'graze', 'rest', 'wander', 'drink', 'watch']);

export function planCreaturePopulation(options = {}) {
	const bounds = populationBounds(options.bounds);
	const species = [...(options.species || [])].filter(item => item?.kind !== 'plant');
	const targetCount = integer(options.count, 12, 0, 512);
	const attempts = integer(options.attempts, Math.max(targetCount * 14, 56), targetCount, 12000);
	const defaultSpacing = Math.max(0.25, finite(options.minimumSpacing, 2.5));
	const random = new EcosystemRandom(ecosystemSeed(options.seed ?? 613, 'creatures'));
	const index = new SpatialCellIndex(defaultSpacing);
	const groups = new CreatureGroupPlanner(bounds, random);
	const placements = [];
	let rejected = 0;
	for (let attempt = 0; attempt < attempts && placements.length < targetCount; attempt += 1) {
		const proposed = randomPoint(bounds, random);
		const proposedHabitat = createHabitatSample(options.habitatAt?.(proposed.x, proposed.z) || {});
		const selected = choosePopulationSpecies(species, proposedHabitat, random);
		if (!selected) {
			rejected += 1;
			continue;
		}
		const point = groups.pointFor(selected, proposed);
		if (options.exclusionAt?.(point.x, point.z, selected)) {
			rejected += 1;
			continue;
		}
		const habitat = createHabitatSample(options.habitatAt?.(point.x, point.z) || {});
		const spacing = Math.max(defaultSpacing, finite(selected.spacing, defaultSpacing));
		if (!index.canPlace(point, spacing * 0.5)) {
			rejected += 1;
			continue;
		}
		const placement = placementFor(selected, point, habitat, options, random, placements.length, attempt);
		index.insert(point, spacing * 0.5, placement);
		placements.push(placement);
	}
	return Object.freeze({
		diagnostics: Object.freeze({ attempts, placed: placements.length, rejected, target: targetCount }),
		placements: Object.freeze(placements)
	});
}

function placementFor(species, point, habitat, options, random, index, attempt) {
	const scale = normalizeScale(species.scale, [0.88, 1.12]);
	return Object.freeze({
		activity: random.pick(species.activities || ACTIVITIES),
		age: random.range(0.25, 1),
		groupId: point.groupId,
		habitat,
		id: `${species.id}:${index}:${ecosystemSeed(options.seed, attempt)}`,
		role: species.role || 'fauna',
		scale: random.range(scale[0], scale[1]),
		speciesId: species.id,
		x: point.x,
		y: finite(options.heightAt?.(point.x, point.z), 0),
		yaw: random.range(-Math.PI, Math.PI),
		z: point.z
	});
}

function integer(value, fallback, minimum, maximum) {
	return Math.round(Math.max(minimum, Math.min(maximum, finite(value, fallback))));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
