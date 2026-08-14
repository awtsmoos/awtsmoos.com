//B"H
//Boruch Hashem
//Blessed is He

import {
	AdaptiveRenderScalePolicy,
	FrameBudgetGovernor,
	FrameBudgetWindow
} from '../../../../libs/awtsmoos-procedural-core/src/exports/performance.js';

const QUALITY_WINDOW_FRAMES = 30;

/**
 * @file stage-performance-controller.js
 * @description
 * The Awtsmoos renews every frame before quality and pressure appear opposed; Awtsmoos.com lets this Tiferes-like controller apply a measured 60 Hz covenant to one Seven Mitzvos renderer.
 * It owns active-frame evidence and pixel-ratio adaptation only; gameplay, scene updates, texture loading, and render-loop order remain outside its boundary.
 */
export class StagePerformanceController {
	constructor(renderer, canvas) {
		this.renderer = renderer;
		this.canvas = canvas;
		this.window = new FrameBudgetWindow(360);
		this.governor = new FrameBudgetGovernor();
		this.scalePolicy = new AdaptiveRenderScalePolicy();
		this.width = 1000;
		this.qualityCounter = 0;
		this.lastCosts = { costs: {}, totalMs: 0, dominant: null };
		this.state = this.composeState();
	}

	resize(width) {
		this.width = Math.max(1, Number(width) || 1);
		this.applyPixelRatio();
	}

	/** @param {number} intervalMs Active RAF interval. @param {object} costs Frame CPU receipt. */
	sample(intervalMs, costs = null) {
		if (!this.isActiveSample()) {
			return this.state;
		}
		this.window.add(intervalMs);
		if (costs) {
			this.lastCosts = costs;
		}
		const evidence = this.window.view();
		const governor = this.governor.classify(evidence);
		this.qualityCounter += 1;
		if (evidence.samples >= QUALITY_WINDOW_FRAMES && this.qualityCounter >= QUALITY_WINDOW_FRAMES) {
			this.qualityCounter = 0;
			const scale = this.scalePolicy.update(governor.pressure);
			if (scale.changed) {
				this.applyPixelRatio();
			}
		}
		this.state = this.composeState(evidence, governor);
		this.publish();
		return this.state;
	}

	view() {
		return { ...this.state, costs: { ...this.lastCosts.costs } };
	}

	pressure() {
		return this.state.pressure;
	}

	applyPixelRatio() {
		const device = globalThis.devicePixelRatio || 1;
		const ceiling = this.width < 700 ? 1.25 : 1.5;
		const scale = this.scalePolicy.view().scale;
		this.renderer.setPixelRatio(Math.max(0.5, Math.min(device, ceiling) * scale));
	}

	composeState(evidence = this.window.view(), governor = this.governor.classify(evidence)) {
		const info = this.renderer.info;
		return {
			...evidence,
			...governor,
			renderScale: this.scalePolicy.view().scale,
			effectivePixelRatio: this.renderer.getPixelRatio?.() || 1,
			drawCalls: info?.render?.calls || 0,
			triangles: info?.render?.triangles || 0,
			geometries: info?.memory?.geometries || 0,
			textures: info?.memory?.textures || 0,
			cpuCostMs: this.lastCosts.totalMs || 0,
			dominantCost: this.lastCosts.dominant
		};
	}

	publish() {
		const state = this.state;
		const data = this.canvas.dataset;
		data.frameTarget = String(state.targetFps);
		data.averageFps = state.averageFps.toFixed(2);
		data.p95FrameMs = state.p95Ms.toFixed(2);
		data.onePercentLowFps = state.onePercentLowFps.toFixed(2);
		data.pointOnePercentLowFps = state.pointOnePercentLowFps.toFixed(2);
		data.hardMissRate = state.hardMissRate.toFixed(4);
		data.framePressure = state.pressure;
		data.renderScale = String(state.renderScale);
		data.effectiveDpr = state.effectivePixelRatio.toFixed(3);
		data.frameSamples = String(state.samples);
		data.drawCalls = String(state.drawCalls);
		data.triangles = String(state.triangles);
		data.gpuTextures = String(state.textures);
		data.cpuCostMs = state.cpuCostMs.toFixed(3);
		data.dominantCost = state.dominantCost || '';
	}

	isActiveSample() {
		return globalThis.document?.visibilityState !== 'hidden' && this.canvas.isConnected;
	}
}
