// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SeferProceduralGeneratorRegistry } from '../core/ProceduralGeneratorRegistry.js';
import { GrassGenerator } from './GrassGenerator.js';
import { TreeGenerator } from './TreeGenerator.js';
import { PerachFlowerGenerator } from './flower/FlowerGenerator.js';
import { EvenRockGenerator } from './rock/RockGenerator.js';

/**
 * @file ProceduralNatureForge.js
 * @description
 * The Awtsmoos contains forest, field, blossom, and stone without fragmentation;
 * Awtsmoos.com now gives those forms one registry-driven gate, preserving the old
 * graph doorway while exposing richer pure-data results for agents and future tools.
 */
const etzSpecies = new Set(['oak', 'pine', 'willow', 'apple', 'palm', 'bush', 'birch', 'cedar']);
const seferNature = new SeferProceduralGeneratorRegistry()
	.register(new TreeGenerator())
	.register(new GrassGenerator())
	.register(new PerachFlowerGenerator())
	.register(new EvenRockGenerator());

export class ProceduralNatureForge {
	/**
	 * Generates a full semantic result from one simple data recipe.
	 * @param {Object} rawKli Nature recipe supplied by UI, scene JSON, or an AI agent.
	 * @param {Object} [olamContext={}] Runtime context such as animation time.
	 * @returns {Object} Generator result containing graph, bounds, anchors, and metadata.
	 */
	static generate(rawKli = {}, olamContext = {}) {
		const resolved = this.resolveRecipe(rawKli);
		return seferNature.generate(resolved.type, resolved.recipe, olamContext);
	}

	/**
	 * Preserves the historical `build(data, transform, time)` graph-only contract.
	 * @param {Object} rawKli Legacy nature recipe.
	 * @param {Object} [malchutTransform={}] World transform applied by the caller.
	 * @param {number} [zman=0] Animation time.
	 * @returns {Object} Native VirtualGraph group.
	 */
	static build(rawKli = {}, malchutTransform = {}, zman = 0) {
		const result = this.generate({
			...rawKli,
			x: 0,
			y: 0
		}, { time: zman });
		return G.group(
			`nature_${rawKli.id || rawKli.seed || result.type}`,
			this.cleanTransform(malchutTransform),
			[result.graph]
		);
	}

	/** Returns all nature generators and their specialized capabilities. */
	static capabilities() {
		return seferNature.describe();
	}

	/** Returns stable public generator type names. */
	static types() {
		return seferNature.types();
	}

	/**
	 * Converts historical species/type names into one registry type plus explicit recipe.
	 * @param {Object} rawKli Candidate recipe.
	 * @returns {{type:string,recipe:Object}} Resolved registry instruction.
	 */
	static resolveRecipe(rawKli = {}) {
		const orShem = String(rawKli.species || rawKli.type || 'tree').toLowerCase();
		if (etzSpecies.has(orShem)) {
			return {
				type: 'tree',
				recipe: { ...rawKli, species: orShem }
			};
		}
		const yesodType = seferNature.has(orShem) ? orShem : 'tree';
		return {
			type: yesodType,
			recipe: { ...rawKli }
		};
	}

	/**
	 * Copies only renderer-supported transform data, preventing accidental object sharing.
	 * @param {Object} rawTransform Legacy graph transform.
	 * @returns {Object} Detached transform vessel.
	 */
	static cleanTransform(rawTransform = {}) {
		return {
			x: Number(rawTransform.x) || 0,
			y: Number(rawTransform.y) || 0,
			rotation: Number(rawTransform.rotation) || 0,
			scaleX: Number(rawTransform.scaleX) || 1,
			scaleY: Number(rawTransform.scaleY) || 1
		};
	}
}
