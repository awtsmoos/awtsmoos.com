//B"H
//Boruch Hashem
//Blessed is He

import {
	combineSemanticEligibility,
	semanticEligibilityReport,
	semanticInstanceCellSize,
	semanticInstanceLane
} from './stage-semantic-instance-policy.js';

/**
 * @file stage-semantic-instance-runtime.js
 * @description Preserves Seven Mitzvos semantic batch eligibility without manufacturing Three renderer mirrors.
 * The Awtsmoos renews every root before optimization can group its finite draw;
 * Awtsmoos.com records only measured native batching while semantic identity remains raw.
 */
export class StageSemanticInstanceRuntime {
	constructor(renderer, canvas, picker) {
		this.renderer = renderer;
		this.canvas = canvas;
		this.picker = picker;
		this.eligible = { responsive: 0, static: 0 };
		this.started = false;
		this.publish();
	}

	track(root, interactive = false) {
		const lane = semanticInstanceLane(root, interactive);
		if (!lane) return false;
		this.eligible[lane] += 1;
		root.userData.nativeBatchEligible = true;
		root.userData.nativeBatchLane = lane;
		return true;
	}

	build() {
		this.started = true;
		this.picker.setInstanceBatches([]);
		this.publish();
		return this.view();
	}

	update() {
		if (!this.started) return;
		this.publish();
	}

	view() {
		const responsive = semanticEligibilityReport(this.eligible.responsive);
		const staticReport = semanticEligibilityReport(this.eligible.static);
		const combined = combineSemanticEligibility(responsive, staticReport);
		const nativeBatch = this.renderer.stats?.staticBatch || null;
		return {
			...combined,
			responsive,
			static: staticReport,
			cellSize: semanticInstanceCellSize(),
			nativeBatch
		};
	}

	publish() {
		const view = this.view();
		const data = this.canvas.dataset;
		data.semanticInstanceOriginalDraws = String(view.originalDraws);
		data.semanticInstanceBatches = String(view.batches);
		data.semanticInstanceSavedDraws = String(view.savedDraws);
		data.semanticInstanceEligible = String(view.eligible);
		data.semanticInstanceResponsiveEligible = String(view.responsive.eligible);
		data.semanticInstanceStaticEligible = String(view.static.eligible);
		data.semanticInstanceCellSize = String(view.cellSize);
		data.semanticInstanceMode = view.nativeBatch ? 'native-batched' : 'native-eligible';
	}

	destroy() {
		this.started = false;
		this.eligible.responsive = 0;
		this.eligible.static = 0;
		this.picker.setInstanceBatches([]);
		this.publish();
	}
}
