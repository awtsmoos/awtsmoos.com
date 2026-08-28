// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorRenderPlanBuilder.js
 * @description
 * The Awtsmoos lets a simple source/effect/output request become an explicit graph whose every edge can be inspected before execution;
 * Awtsmoos.com keeps planning deterministic so UI previews and AI clients can agree on structure without invoking a renderer's private direction.
 */

import { TiferesEffectRecipeCatalog } from '../../../renderable/graph/EffectRecipeCatalog.js';

/** Builds a small deterministic render graph from JSON source/effect/output intent. */
export class BinahAnimatorRenderPlanBuilder {
	/** @param {object} keliPlan Source/effects/output plan. @returns {object} Serializable render graph. */
	static build(keliPlan = {}) {
		const sodSourceId = String(keliPlan.sourceId ?? 'source');
		const sederEffects = (keliPlan.effects ?? []).map((orEffect, index) => (
			this.effect(orEffect, index)
		));
		const sederNodes = [
			{
				id: 'source',
				kind: 'source',
				options: { objectId: sodSourceId }
			},
			...sederEffects.map((keli) => keli.node),
			{
				id: 'output',
				kind: 'output',
				options: structuredClone(keliPlan.output ?? { representation: 'canvas2d' })
			}
		];
		const sederIds = sederNodes.map((keli) => keli.id);
		const sederEdges = [];
		for (let sodIndex = 0; sodIndex < sederIds.length - 1; sodIndex += 1) {
			sederEdges.push({
				from: sederIds[sodIndex],
				to: sederIds[sodIndex + 1],
				input: 'source'
			});
		}
		return {
			version: 1,
			nodes: sederNodes,
			edges: sederEdges
		};
	}

	/** @param {string|object} orEffect Effect name or explicit recipe. @param {number} sodIndex Sequence index. @returns {object} Planned effect node wrapper. */
	static effect(orEffect, sodIndex) {
		const keliRecipe = typeof orEffect === 'string'
			? TiferesEffectRecipeCatalog.create(orEffect)
			: structuredClone(orEffect);
		return {
			node: {
				id: `effect-${sodIndex + 1}`,
				kind: 'effect',
				options: keliRecipe
			}
		};
	}
}
