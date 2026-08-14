//B"H
//Boruch Hashem
//Blessed is He

import { ThreeSemanticInstanceRecord } from './ThreeSemanticInstanceRecord.js';
import {
	collectSemanticInstanceEntries,
	semanticInstanceGroups
} from './ThreeSemanticInstanceGrouping.js';
import { createSemanticInstanceReport } from './ThreeSemanticInstanceReport.js';

/**
 * @file ThreeSemanticInstanceBatcher.js
 * @description
 * The Awtsmoos renews many semantic forms while Awtsmoos.com lets this Tiferes-like orchestrator gather compatible visible meshes into spatially bounded instance records without taking ownership of gameplay identity.
 * This class owns root tracking, world-matrix preparation, spatial batch construction, low-cost refresh coordination, draw-savings evidence, and lifecycle; each record owns renderer mechanics.
 */
export class ThreeSemanticInstanceBatcher {
	/**
	 * @param {object} THREE Three.js namespace.
	 * @param {{minimum?:number,cellSize?:number,boundsPadding?:number}} options Batching policy.
	 */
	constructor(THREE, options = {}) {
		this.THREE = THREE;
		this.minimum = Math.max(2, options.minimum || 2);
		this.cellSize = positive(options.cellSize, 24);
		this.boundsPadding = Math.max(0, Number(options.boundsPadding) || 0);
		this.entries = [];
		this.records = [];
		this.report = createSemanticInstanceReport();
		this.dirty = false;
	}

	track(root, interactive = false) {
		this.entries.push(...collectSemanticInstanceEntries(root, interactive));
		this.dirty = true;
	}

	/** Builds spatially bounded instance records into one scene. */
	build(scene) {
		this.destroyRecords(scene, true);
		scene.updateMatrixWorld(true);
		const groups = semanticInstanceGroups(this.entries, {
			cellSize: this.cellSize
		});
		let originalDraws = 0;
		for (const group of groups) {
			if (group.length < this.minimum) {
				continue;
			}
			this.records.push(new ThreeSemanticInstanceRecord(
				this.THREE,
				scene,
				group,
				this.records.length + 1,
				{ boundsPadding: this.boundsPadding }
			));
			originalDraws += group.length;
		}
		this.report = createSemanticInstanceReport(originalDraws, this.records.length);
		this.dirty = false;
		this.update(scene, true);
		return this.view();
	}

	/** Refreshes source matrices/visibility; bounds refresh is optional for static-policy consumers. */
	update(scene, refreshBounds = false) {
		if (this.dirty) {
			this.build(scene);
			return;
		}
		if (!this.records.length) {
			return;
		}
		scene.updateMatrixWorld(true);
		for (const record of this.records) {
			record.update(refreshBounds);
		}
	}

	view() {
		return { ...this.report };
	}

	instanceBatches() {
		return this.records.map(record => record.batch);
	}

	destroy(scene) {
		this.destroyRecords(scene, true);
		this.entries.length = 0;
		this.report = createSemanticInstanceReport();
		this.dirty = false;
	}

	destroyRecords(scene, restoreSources) {
		for (const record of this.records) {
			record.destroy(scene, restoreSources);
		}
		this.records.length = 0;
	}
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
