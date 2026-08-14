//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import {
	combineSemanticInstanceReports,
	createSevenSemanticBatchers,
	semanticInstanceCellSize,
	semanticInstanceLane
} from './stage-semantic-instance-policy.js';

const STATIC_SYNC_SECONDS = 0.2;

/**
 * @file stage-semantic-instance-runtime.js
 * @description
 * The Awtsmoos renews responsive covenant landmarks and quiet decorative matter through different renderer rhythms while their semantic roots remain one gameplay truth;
 * Awtsmoos.com lets this runtime mirror nearby interactive spatial batches every frame and static batches at low cadence, preserving culling, picking identity, and measurable draw savings.
 * It owns Seven stage lifecycle only; grouping, geometry, materials, canonical state, and interaction law remain separate.
 */
export class StageSemanticInstanceRuntime {
	constructor(scene, canvas, picker) {
		this.scene = scene;
		this.canvas = canvas;
		this.picker = picker;
		this.batchers = createSevenSemanticBatchers(THREE);
		this.dirty = { responsive: false, static: false };
		this.reports = emptyReports();
		this.started = false;
		this.staticTimer = 0;
	}

	track(root, interactive = false) {
		const lane = semanticInstanceLane(root, interactive);
		if (!lane) {
			return;
		}
		this.batchers[lane].track(root, interactive);
		this.dirty[lane] = true;
	}

	build() {
		this.reports.responsive = this.batchers.responsive.build(this.scene);
		this.reports.static = this.batchers.static.build(this.scene);
		this.syncPickerTargets();
		this.dirty.responsive = false;
		this.dirty.static = false;
		this.started = true;
		this.staticTimer = 0;
		this.publish();
		return this.view();
	}

	update(delta = 0) {
		if (!this.started || this.dirty.responsive || this.dirty.static) {
			this.build();
			return;
		}
		this.batchers.responsive.update(this.scene, false);
		this.staticTimer += Math.max(0, Number(delta) || 0);
		if (this.staticTimer < STATIC_SYNC_SECONDS) {
			return;
		}
		this.staticTimer = 0;
		this.batchers.static.update(this.scene, false);
	}

	view() {
		return {
			...combineSemanticInstanceReports(
				this.reports.responsive,
				this.reports.static
			),
			responsive: { ...this.reports.responsive },
			static: { ...this.reports.static }
		};
	}

	destroy() {
		this.picker.setInstanceBatches([]);
		this.batchers.responsive.destroy(this.scene);
		this.batchers.static.destroy(this.scene);
		this.reports = emptyReports();
		this.started = false;
		this.staticTimer = 0;
	}

	syncPickerTargets() {
		this.picker.setInstanceBatches([
			...this.batchers.responsive.instanceBatches(),
			...this.batchers.static.instanceBatches()
		]);
	}

	publish() {
		const combined = this.view();
		const data = this.canvas.dataset;
		writeReport(data, 'semanticInstance', combined);
		writeReport(data, 'responsiveInstance', this.reports.responsive);
		writeReport(data, 'staticInstance', this.reports.static);
		data.semanticInstanceCellSize = String(semanticInstanceCellSize());
	}
}

function writeReport(data, prefix, report) {
	data[`${prefix}OriginalDraws`] = String(report.originalDraws);
	data[`${prefix}Batches`] = String(report.batches);
	data[`${prefix}SavedDraws`] = String(report.savedDraws);
}

function emptyReports() {
	const report = { originalDraws: 0, batches: 0, savedDraws: 0 };
	return {
		responsive: { ...report },
		static: { ...report }
	};
}
