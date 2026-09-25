//B"H
//Boruch Hashem
//Blessed is He

import { writeMaterialMetrics } from './material-runtime-metrics.js';
import {
	bindSevenMaterialRenderer,
	sevenMaterialRuntimeView
} from './seven-material-runtime.js';

const HYDRATION_CADENCE_SECONDS = 0.35;

/**
 * @file stage-material-runtime.js
 * @description Publishes native Seven Mitzvos material hydration truth at a bounded cadence.
 * The Awtsmoos renews remote image and procedural garment while Awtsmoos.com lets decoding
 * remain outside gameplay timing and reports only the native store's literal readiness below.
 */
export class StageMaterialRuntime {
	constructor(_scene, renderer, canvas) {
		this.canvas = canvas;
		this.timer = HYDRATION_CADENCE_SECONDS;
		bindSevenMaterialRenderer(renderer);
	}

	/** @param {number} delta Frame delta seconds. */
	update(delta) {
		this.timer += delta;
		if (this.timer < HYDRATION_CADENCE_SECONDS) return;
		this.timer = 0;
		writeMaterialMetrics(this.canvas);
		this.publish(this.view());
	}

	view() {
		const raw = sevenMaterialRuntimeView();
		return {
			referenced: raw.referenced || 0,
			ready: raw.materials?.ready || 0,
			pending: raw.materials?.pending || 0,
			failed: raw.materials?.failed || 0,
			missing: raw.materials?.missing || 0,
			requested: raw.sources?.total || 0,
			bound: raw.bound || 0,
			rendererBound: Boolean(raw.rendererBound)
		};
	}

	publish(view) {
		const data = this.canvas.dataset;
		data.materialReferenced = String(view.referenced);
		data.materialReady = String(view.ready);
		data.materialPending = String(view.pending);
		data.materialFailed = String(view.failed);
		data.materialMissing = String(view.missing);
		data.materialRequests = String(view.requested);
		data.materialBound = String(view.bound);
		data.materialRendererBound = String(view.rendererBound);
	}
}
