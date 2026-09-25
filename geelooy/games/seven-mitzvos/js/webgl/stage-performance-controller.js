//B"H
//Boruch Hashem
//Blessed is He

import {
	AdaptiveRenderScalePolicy,
	FrameBudgetGovernor,
	FrameBudgetWindow
} from '../../../../libs/awtsmoos-procedural-core/src/exports/performance.js';
import { publishStagePerformance } from './stage-performance-publisher.js';

const QUALITY_WINDOW_FRAMES = 30;

/**
 * @file stage-performance-controller.js
 * @description
 * The Awtsmoos renews every frame before quality and pressure appear opposed;
 * Awtsmoos.com lets this Tiferes-like controller scale the real native backing store
 * while preserving measured frame-budget evidence without renderer compatibility tricks.
 */
export class StagePerformanceController {
	constructor(renderer, canvas) {
		this.renderer = renderer;
		this.canvas = canvas;
		this.window = new FrameBudgetWindow(360);
		this.governor = new FrameBudgetGovernor();
		this.scalePolicy = new AdaptiveRenderScalePolicy();
		this.width = 1;
		this.height = 1;
		this.qualityPixelRatio = Infinity;
		this.effectivePixelRatio = 1;
		this.qualityCounter = 0;
		this.lastCosts = { costs: {}, totalMs: 0, dominant: null };
		this.state = this.composeState();
	}

	resize(width, height = this.height) {
		this.width = Math.max(1, Number(width) || 1);
		this.height = Math.max(1, Number(height) || 1);
		this.applyResolution();
	}

	setQualityPixelRatio(maximum) {
		this.qualityPixelRatio = Math.max(0.5, Number(maximum) || 1);
		this.applyResolution();
	}

	sample(intervalMs, costs = null) {
		if (!this.isActiveSample()) return this.state;
		this.window.add(intervalMs);
		if (costs) this.lastCosts = costs;
		const evidence = this.window.view();
		const governor = this.governor.classify(evidence);
		this.qualityCounter += 1;
		if (evidence.samples >= QUALITY_WINDOW_FRAMES && this.qualityCounter >= QUALITY_WINDOW_FRAMES) {
			this.qualityCounter = 0;
			const scale = this.scalePolicy.update(governor.pressure);
			if (scale.changed) this.applyResolution();
		}
		this.state = this.composeState(evidence, governor);
		publishStagePerformance(this.canvas, this.state);
		return this.state;
	}

	view() {
		return { ...this.state, costs: { ...this.lastCosts.costs } };
	}

	pressure() {
		return this.state.pressure;
	}

	applyResolution() {
		const device = globalThis.devicePixelRatio || 1;
		const deviceCeiling = this.width < 700 ? 1.25 : 1.5;
		const scale = this.scalePolicy.view().scale;
		this.effectivePixelRatio = Math.max(
			0.5,
			Math.min(device, deviceCeiling, this.qualityPixelRatio) * scale
		);
		this.renderer.setSize(
			Math.max(1, Math.round(this.width * this.effectivePixelRatio)),
			Math.max(1, Math.round(this.height * this.effectivePixelRatio))
		);
	}

	composeState(evidence = this.window.view(), governor = this.governor.classify(evidence)) {
		const stats = this.renderer.stats || {};
		return {
			...evidence,
			...governor,
			renderScale: this.scalePolicy.view().scale,
			effectivePixelRatio: this.effectivePixelRatio,
			drawCalls: stats.draws || 0,
			triangles: stats.triangles || 0,
			geometries: 0,
			textures: 0,
			cpuCostMs: this.lastCosts.totalMs || 0,
			dominantCost: this.lastCosts.dominant
		};
	}

	isActiveSample() {
		return globalThis.document?.visibilityState !== 'hidden' && this.canvas.isConnected;
	}
}
