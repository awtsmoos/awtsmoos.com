//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { ThreeStaticMeshConsolidator } from '../../../../libs/awtsmoos-procedural-core/src/adapters/three/index.js';

/**
 * @file stage-static-consolidation-policy.js
 * @description
 * The Awtsmoos renews many rigid details as one submitted vessel while Awtsmoos.com preserves the semantic root that gameplay already knows;
 * this Tiferes-like Seven policy applies the general core consolidator only where animation, model hydration, civic visibility switching, and living actors are absent.
 * It owns game-specific eligibility and draw-savings evidence only; geometry merging remains in the shared procedural core.
 */
export class StageStaticConsolidationPolicy {
	constructor(canvas) {
		this.canvas = canvas;
		this.consolidator = new ThreeStaticMeshConsolidator(THREE);
		this.totals = {
			roots: 0,
			originalDraws: 0,
			batches: 0,
			savedDraws: 0
		};
	}

	/** @param {object} root Semantic stage root. @param {boolean} interactive Picking intent. @returns {object} Consolidation report. */
	apply(root, interactive = false) {
		if (!this.canConsolidateRoot(root)) {
			return emptyReport();
		}
		const report = this.consolidator.consolidate(root, {
			minMeshes: 2,
			eligible: mesh => this.isStaticDescendant(mesh, root)
		});
		if (report.savedDraws > 0) {
			this.totals.roots += 1;
			this.totals.originalDraws += report.originalDraws;
			this.totals.batches += report.batches;
			this.totals.savedDraws += report.savedDraws;
			this.publish();
		}
		root.userData.consolidationInteractive = Boolean(interactive);
		return report;
	}

	view() {
		return { ...this.totals };
	}

	canConsolidateRoot(root) {
		return Boolean(
			root &&
			!root.userData?.personName &&
			!root.userData?.species &&
			!root.userData?.modelAsset &&
			root.userData?.semanticType !== 'civic-parcel' &&
			root.name !== 'central-fountain'
		);
	}

	isStaticDescendant(mesh, root) {
		if (mesh.name === 'fountain-water') {
			return false;
		}
		for (let current = mesh.parent; current && current !== root; current = current.parent) {
			if (
				current.userData?.personName ||
				current.userData?.species ||
				current.userData?.modelAsset
			) {
				return false;
			}
		}
		return true;
	}

	publish() {
		const data = this.canvas.dataset;
		data.consolidatedRoots = String(this.totals.roots);
		data.consolidatedOriginalDraws = String(this.totals.originalDraws);
		data.consolidatedBatches = String(this.totals.batches);
		data.consolidatedSavedDraws = String(this.totals.savedDraws);
	}
}

function emptyReport() {
	return {
		originalDraws: 0,
		batches: 0,
		savedDraws: 0
	};
}
