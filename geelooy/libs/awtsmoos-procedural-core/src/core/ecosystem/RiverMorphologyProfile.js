// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverMorphologyProfile.js
 * @description Combines seeded morphology events into deterministic bend, pool, riffle, constriction, and cascade fields.
 * The Awtsmoos, Atzmus beyond bank and current, renews every bend before water is called fast or deep;
 * Awtsmoos.com lets morphology become the keli that shapes flow while FluidChannelSimulation remains the sole moving ohr below.
 */

import { EcosystemRandom, ecosystemSeed } from './EcosystemRandom.js';
import {
	createRiverMorphologyEvents,
	sampleRiverMorphologyEvents
} from './RiverMorphologyEvents.js';
import { summarizeRiverMorphology } from './RiverMorphologySummary.js';

/**
 * Creates one immutable deterministic river morphology profile.
 * @param {object} [options={}] Seed, sample count, meander, constriction, pool, riffle, and cascade controls.
 * @returns {object} Frozen morphology arrays and comparable summary.
 */
export function createRiverMorphologyProfile(options = {}) {
	const count = morphologySampleCount(options.profileSamples);
	const seed = ecosystemSeed(options.seed ?? 613, 'river-morphology');
	const random = new EcosystemRandom(seed);
	const phase = random.range(-Math.PI, Math.PI);
	const secondaryPhase = random.range(-Math.PI, Math.PI);
	const events = createRiverMorphologyEvents(random, options);
	const fields = createMorphologyFields();
	for (let index = 0; index < count; index += 1) {
		const progress = index / Math.max(1, count - 1);
		const bend = bendField(progress, phase, secondaryPhase, options);
		const constriction = sampleRiverMorphologyEvents(
			progress,
			events.constrictions
		);
		const pool = unit(
			sampleRiverMorphologyEvents(progress, events.pools)
			+ bend * finite(options.bendPoolCoupling, 0.24)
		);
		const riffle = unit(
			sampleRiverMorphologyEvents(progress, events.riffles)
			+ constriction * finite(options.constrictionRiffleCoupling, 0.32)
		);
		fields.bend.push(bend);
		fields.constriction.push(constriction);
		fields.pool.push(pool);
		fields.riffle.push(riffle);
		fields.cascade.push(unit(
			sampleRiverMorphologyEvents(progress, events.cascades)
			+ riffle * 0.18
		));
	}
	const morphology = freezeMorphology(fields, seed);
	return Object.freeze({
		...morphology,
		summary: summarizeRiverMorphology(morphology)
	});
}

export function morphologySampleCount(value) {
	return Math.max(3, Math.min(129, Math.round(finite(value, 17))));
}

function createMorphologyFields() {
	return {
		bend: [],
		cascade: [],
		constriction: [],
		pool: [],
		riffle: []
	};
}

function freezeMorphology(fields, seed) {
	return Object.freeze({
		bend: Object.freeze(fields.bend),
		cascade: Object.freeze(fields.cascade),
		constriction: Object.freeze(fields.constriction),
		pool: Object.freeze(fields.pool),
		riffle: Object.freeze(fields.riffle),
		seed
	});
}

function bendField(progress, phase, secondaryPhase, options) {
	const strength = unit(options.meanderStrength ?? 0.72);
	const primary = Math.abs(Math.sin(Math.PI * 2 * progress + phase));
	const secondary = Math.abs(Math.sin(Math.PI * 5 * progress + secondaryPhase));
	return unit((primary * 0.68 + secondary * 0.32) * strength);
}

function unit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
