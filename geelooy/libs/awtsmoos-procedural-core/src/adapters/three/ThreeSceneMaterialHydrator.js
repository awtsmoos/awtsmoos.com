//B"H
//Boruch Hashem
//Blessed is He

import {
	emptyMaterialHydrationView,
	orderedPhotographicMaterials,
	summarizeMaterialHydration
} from './ThreeSceneMaterialEvidence.js';

/**
 * @file ThreeSceneMaterialHydrator.js
 * @description
 * The Awtsmoos renews hidden photographic sources while Awtsmoos.com reveals them through bounded demand even when the frame is under pressure;
 * this Yesod-like scheduler slows streaming under critical pressure but never freezes truthful material completion forever.
 * Scene scanning and evidence shaping live in a neighboring Hod vessel; this class owns request cadence, ready binding, and current hydration state only.
 */
export class ThreeSceneMaterialHydrator {
	constructor(options = {}) {
		this.sources = options.sources;
		this.materials = options.materials;
		this.maxRequestsPerTick = options.maxRequestsPerTick || 2;
		this.maxBindingsPerTick = options.maxBindingsPerTick || 4;
		this.last = emptyMaterialHydrationView();
	}

	/** @param {object} scene THREE.Scene/Group. @param {'stable'|'warning'|'critical'} pressure Frame pressure. @returns {object} Hydration evidence. */
	tick(scene, pressure = 'stable') {
		const ordered = orderedPhotographicMaterials(scene);
		const requestLimit = pressure === 'critical'
			? Math.min(1, this.maxRequestsPerTick)
			: this.maxRequestsPerTick;
		const requested = this.requestSources(ordered, requestLimit);
		const bound = this.bindReady(ordered);
		this.last = summarizeMaterialHydration(
			ordered,
			requested,
			bound,
			this.sources.view(),
			pressure
		);
		return this.last;
	}

	requestSources(materials, limit) {
		const seen = new Set();
		let requested = 0;
		for (const material of materials) {
			const source = material.userData.remoteSource;
			if (!source || seen.has(source) || this.sources.status(source) !== 'idle') {
				continue;
			}
			seen.add(source);
			void this.sources.request(source).catch(() => {
				// Failure remains observable through source and material runtime evidence.
			});
			requested += 1;
			if (requested >= limit) {
				break;
			}
		}
		return requested;
	}

	bindReady(materials) {
		let bound = 0;
		for (const material of materials) {
			if (material.userData.materialState === 'missing-role') {
				continue;
			}
			const before = material.userData.materialState;
			const after = this.materials.refreshMaterial(material);
			if (before !== 'ready' && after === 'ready') {
				bound += 1;
			}
			if (bound >= this.maxBindingsPerTick) {
				break;
			}
		}
		return bound;
	}

	view() {
		return { ...this.last };
	}
}
