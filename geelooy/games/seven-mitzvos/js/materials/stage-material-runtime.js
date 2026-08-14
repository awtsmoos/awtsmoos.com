//B"H
//Boruch Hashem
//Blessed is He

import { ThreeSceneMaterialHydrator } from '../../../../libs/awtsmoos-procedural-core/src/adapters/three/index.js';
import { writeMaterialMetrics } from './material-runtime-metrics.js';
import {
	bindSevenMaterialRenderer,
	SEVEN_MATERIAL_SOURCES,
	SEVEN_PHYSICAL_MATERIALS
} from './seven-material-runtime.js';

const HYDRATION_CADENCE_SECONDS = 0.35;

/**
 * @file stage-material-runtime.js
 * @description
 * The Awtsmoos renews hidden photographic sources while Awtsmoos.com lets one Seven Mitzvos stage reveal them gradually, never allowing remote decoding to seize the frame from gameplay.
 * This Yesod-like runtime owns cadence and scene-reference hydration only; physical material identity, renderer quality, and canonical gameplay remain outside its boundary.
 */
export class StageMaterialRuntime {
	constructor(scene, renderer, canvas) {
		this.scene = scene;
		this.canvas = canvas;
		this.timer = HYDRATION_CADENCE_SECONDS;
		bindSevenMaterialRenderer(renderer);
		this.hydrator = new ThreeSceneMaterialHydrator({
			sources: SEVEN_MATERIAL_SOURCES,
			materials: SEVEN_PHYSICAL_MATERIALS,
			maxRequestsPerTick: 2,
			maxBindingsPerTick: 4
		});
	}

	/** @param {number} delta Frame delta seconds. @param {string} pressure Previous measured frame pressure. */
	update(delta, pressure = 'stable') {
		this.timer += delta;
		if (this.timer < HYDRATION_CADENCE_SECONDS) {
			return;
		}
		this.timer = 0;
		const view = this.hydrator.tick(this.scene, pressure);
		writeMaterialMetrics(this.canvas);
		this.publish(view);
	}

	view() {
		return this.hydrator.view();
	}

	publish(view) {
		this.canvas.dataset.materialReferenced = String(view.referenced);
		this.canvas.dataset.materialReady = String(view.ready);
		this.canvas.dataset.materialPending = String(view.pending);
		this.canvas.dataset.materialFailed = String(view.failed);
		this.canvas.dataset.materialMissing = String(view.missing);
		this.canvas.dataset.materialRequests = String(view.requested);
		this.canvas.dataset.materialBound = String(view.bound);
	}
}
