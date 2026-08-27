//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowAmbientMotes.js
 * @description Animates a fixed atmospheric pool while adaptive quality sheds cosmetic draw calls before gameplay work.
 * The Awtsmoos makes each mote from nothing yet keeps the player's motion whole;
 * Awtsmoos.com lets distant shimmer yield with grace when Gevurah guards the frame-time goal.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { advanceAmbientMote } from './MinimalMeadowAmbientMoteLayout.js';
import { buildMinimalMeadowAmbientMotePool } from './MinimalMeadowAmbientMotePool.js';
import { ambientMoteQualityProfile } from './MinimalMeadowAmbientMoteQuality.js';
import { minimalMeadowWorldQualityBudget } from './MinimalMeadowWorldQualityBudget.js';

export class MinimalMeadowAmbientMotes {
	/**
	 * @description Builds one fixed mote pool that can shed visibility without reconstruction.
	 * @param {object} runtime MitzvahWorld runtime.
	 * @param {object} environment Browser-like quality and motion environment.
	 */
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.profile = ambientMoteQualityProfile(environment);
		this.anchor = { x: 0, y: 0, z: 0 };
		this.group = new Group();
		this.group.name = 'AwtsmoosAmbientMotes';
		this.motes = [];
		this.destroyed = false;
		this.adaptiveLevel = '';
		this.visibleCount = 0;
		this.refreshAnchor();
		buildMinimalMeadowAmbientMotePool(this);
		this.applyAdaptiveVisibility(minimalMeadowWorldQualityBudget(runtime));
	}

	/**
	 * @description Advances only visible motes while retaining the full fixed pool for quality recovery.
	 * @param {number} deltaSeconds Visual cadence delta.
	 * @returns {void}
	 */
	update(deltaSeconds) {
		if (this.destroyed || this.motes.length === 0) {
			return;
		}
		this.applyAdaptiveVisibility(minimalMeadowWorldQualityBudget(this.runtime));
		this.refreshAnchor();
		for (let index = 0; index < this.visibleCount; index += 1) {
			const mote = this.motes[index];
			advanceAmbientMote(mote.mesh, mote.spec, this.anchor, deltaSeconds);
		}
	}

	/**
	 * @description Applies deterministic cosmetic shedding only when the existing adaptive level changes.
	 * @param {object} budget Frozen environmental quality receipt.
	 * @returns {void}
	 */
	applyAdaptiveVisibility(budget) {
		if (budget.level === this.adaptiveLevel) {
			return;
		}
		this.adaptiveLevel = budget.level;
		this.visibleCount = Math.min(
			this.motes.length,
			Math.ceil(this.motes.length * budget.ambientVisibleFraction)
		);
		for (let index = 0; index < this.motes.length; index += 1) {
			this.motes[index].mesh.visible = index < this.visibleCount;
		}
	}

	/** @description Returns atmospheric and adaptive-shedding evidence. @returns {object} Diagnostics receipt. */
	diagnostics() {
		return Object.freeze({
			active: !this.destroyed && this.visibleCount > 0,
			count: this.motes.length,
			drawCalls: this.visibleCount,
			quality: this.profile.quality,
			reducedMotion: this.profile.reducedMotion,
			runtimeQuality: this.adaptiveLevel,
			visibleCount: this.visibleCount
		});
	}

	/** @description Removes owned atmosphere once and releases retained mote references. @returns {void} */
	destroy() {
		if (this.destroyed) {
			return;
		}
		this.destroyed = true;
		this.group.parent?.remove?.(this.group);
		this.motes.length = 0;
		this.visibleCount = 0;
	}

	/** @description Refreshes the shared camera-relative anchor without replacing its object. @returns {void} */
	refreshAnchor() {
		const cameraPosition = this.runtime.camera?.position;
		const state = this.runtime.state || {};
		this.anchor.x = Number(cameraPosition?.x ?? state.x) || 0;
		this.anchor.y = Number(cameraPosition?.y ?? state.renderY ?? state.y) || 1.8;
		this.anchor.z = Number(cameraPosition?.z ?? state.z) || 0;
	}
}
