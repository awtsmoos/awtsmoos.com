// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorRenderDomain.js
 * @description
 * The Awtsmoos lets semantic render capability remain stable while runtime hardware appears or disappears beneath it;
 * Awtsmoos.com exposes backend, representation, effect, graph schema, and pure plan data without leaking a renderer's mutable spirit.
 */

import { TiferesEffectRecipeCatalog } from '../../../renderable/graph/EffectRecipeCatalog.js';
import { OR_RENDER_GRAPH_SCHEMA } from '../../../renderable/graph/RenderGraphSchemaData.js';
import { OR_REPRESENTATION_KINDS } from '../../../renderable/schema/RepresentationSchemaData.js';
import { BinahAnimatorRenderPlanBuilder } from './AnimatorRenderPlanBuilder.js';

/** Publishes backend-neutral render discovery and planning. */
export class TiferesAnimatorRenderDomain {
	constructor(keterRuntime = {}) {
		this.keterRuntime = keterRuntime;
	}

	/** @returns {object[]} Canvas/WebGL/WebGPU backend availability without creating resources. */
	backends() {
		const keliStatus = this.runtimeStatus();
		return [
			{ id: 'canvas2d', available: true, durable: false, current: true },
			{ id: 'webgl', available: Boolean(keliStatus.capabilities?.available), durable: false, current: Boolean(keliStatus.capabilities?.available) },
			{ id: 'webgpu', available: false, durable: false, readySignal: Boolean(keliStatus.capabilities?.webgpuReady), current: false }
		];
	}

	/** @returns {object[]} Durable representation kinds plus live adapter support. */
	representations() {
		const sederLive = this.runtimeStatus().representations ?? [];
		return OR_REPRESENTATION_KINDS.map((shemKind) => ({
			kind: shemKind,
			durableRecipe: true,
			runtimeAdapter: sederLive.includes(shemKind)
		}));
	}

	/** @returns {object} Built-in non-destructive effect catalog. */
	effects() {
		return TiferesEffectRecipeCatalog.all();
	}

	/** @param {string} shemEffect Effect name. @param {object} keilimOverrides Overrides. @returns {object} Effect recipe. */
	effect(shemEffect, keilimOverrides = {}) {
		return TiferesEffectRecipeCatalog.create(shemEffect, keilimOverrides);
	}

	/** @returns {object} Detached render-graph schema. */
	graphSchema() {
		return structuredClone(OR_RENDER_GRAPH_SCHEMA);
	}

	/** @param {object} keliPlan Source/effects/output intent. @returns {object} Pure render graph. */
	plan(keliPlan = {}) {
		return BinahAnimatorRenderPlanBuilder.build(keliPlan);
	}

	/** @returns {object} JSON-safe runtime status or stable unavailable shape. */
	runtimeStatus() {
		const keterRenderRuntime = this.keterRuntime.renderRuntime
			?? this.keterRuntime.app?.nle?.renderRuntime
			?? null;
		return keterRenderRuntime?.status?.() ?? {
			capabilities: { available: false, webgpuReady: Boolean(globalThis.navigator?.gpu) },
			representations: []
		};
	}
}
