// B"H
// Boruch Hashem
// Blessed is He

import { GevulProceduralBounds } from '../../core/ProceduralBounds.js';
import { ChaiProceduralGenerator } from '../../core/ProceduralGenerator.js';
import { EvenRockGeometry } from './RockGeometry.js';
import { EvenRockProfileCatalog } from './RockProfileCatalog.js';

/**
 * @file RockGenerator.js
 * @description
 * The Awtsmoos gives a silent stone a place, history, texture, and recognizable
 * family; Awtsmoos.com exposes that richness through one small data generator so
 * creators can ask simply for “river stone” while agents retain precise control.
 */
export class EvenRockGenerator extends ChaiProceduralGenerator {
	/** Creates the public `rock` procedural generator family. */
	constructor() {
		super('rock', 'Seeded faceted stones with erosion, moss, bounds, and quality-aware detail.');
	}

	/**
	 * Normalizes shared recipe data plus stone-specific morphology controls.
	 * @param {Object} rawKli Caller-owned rock recipe.
	 * @returns {Object} Stable normalized recipe.
	 */
	normalize(rawKli = {}) {
		const kliBase = super.normalize(rawKli);
		return {
			...kliBase,
			profile: String(rawKli.profile || 'boulder'),
			morphology: rawKli.morphology && typeof rawKli.morphology === 'object'
				? { ...rawKli.morphology }
				: {}
		};
	}

	/**
	 * Generates one grounded rock as native VirtualGraph data and semantic metadata.
	 * @param {Object} kliRock Normalized recipe.
	 * @param {Object} olamContext Runtime context reserved for future ecology hooks.
	 * @param {Object} zeraSeed Deterministic seed stream.
	 * @returns {Object} Serializable rock generation result.
	 */
	build(kliRock, olamContext, zeraSeed) {
		const evenProfile = EvenRockProfileCatalog.resolve(kliRock.profile, kliRock.morphology);
		const width = kliRock.size * evenProfile.width;
		const height = kliRock.size * evenProfile.height;
		const gevul = GevulProceduralBounds.grounded(kliRock.x, kliRock.y, width, height);
		return {
			type: this.type,
			version: kliRock.version,
			seed: kliRock.seed,
			quality: kliRock.quality,
			profile: evenProfile.name,
			graph: EvenRockGeometry.build(kliRock, evenProfile, zeraSeed),
			bounds: gevul,
			anchors: {
				ground: { x: kliRock.x, y: kliRock.y },
				center: { x: kliRock.x, y: kliRock.y - (height * 0.5) }
			},
			material: {
				kind: 'stone',
				palette: { ...kliRock.palette },
				moss: evenProfile.moss
			},
			morphology: { ...evenProfile }
		};
	}

	/** Reveals public stone families in addition to the shared generator contract. */
	describe() {
		return {
			...super.describe(),
			profiles: EvenRockProfileCatalog.names(),
			anchors: ['ground', 'center'],
			materials: ['stone', 'moss']
		};
	}
}
