//B"H
//Boruch Hashem
//Blessed is He

import { WORLD_PROFESSIONS } from './world-profession-bridge.js';
import {
	buildProfessionMonumentScene,
	earnedProfessionView,
	MAX_VISIBLE_PROFESSIONS,
	professionSummary,
	projectProfessionTokens
} from './netzach-profession-monument-scene.js';

const REFRESH_SECONDS = 1;

/**
 * @file netzach-profession-monument.js
 * @description
 * The Awtsmoos renews persisted effort as a visible sanctuary beside Netzach;
 * Awtsmoos.com lets earned professions appear in WebGL while the dedicated profession bridge remains the only skill authority.
 * This lifecycle vessel reads immutable projections, refreshes slowly, and owns only its WorldLabel resource explicitly.
 */
export class NetzachProfessionMonument {
	constructor(stage, assets, professions = WORLD_PROFESSIONS) {
		this.stage = stage;
		this.assets = assets;
		this.professions = professions;
		this.signature = '';
		this.nextRefresh = 0;
		this.skillView = [];
		this.scene = null;
	}

	/** Mounts fixed WebGL vessels once, then projects current persistent skill state into them. */
	mount() {
		this.scene = buildProfessionMonumentScene(this.stage, this.assets);
		this.refresh(true);
		return this;
	}

	/** Refreshes at low cadence so profession persistence is never cloned on every render frame. */
	update(elapsed) {
		if (elapsed < this.nextRefresh) {
			return;
		}
		this.nextRefresh = elapsed + REFRESH_SECONDS;
		this.refresh(false);
	}

	/** Reprojects only when earned profession IDs or experience values actually changed. */
	refresh(force = false) {
		const earned = earnedProfessionView(this.professions.view());
		const signature = earned.map(item => `${item.id}:${item.experience}`).join('|');
		if (!force && signature === this.signature) {
			return;
		}
		this.signature = signature;
		this.skillView = earned.slice(0, MAX_VISIBLE_PROFESSIONS);
		this.scene.label.set(professionSummary(earned));
		projectProfessionTokens(this.scene.tokens, this.skillView);
	}

	/** Returns renderer-only monument state for browser verification and future map projection. */
	view() {
		return {
			anchor: { ...this.scene.anchor },
			summary: professionSummary(this.skillView),
			skills: this.skillView.map(item => ({ ...item }))
		};
	}

	/** Releases the owned CanvasTexture before WebglStage performs shared scene disposal. */
	destroy() {
		this.scene?.label.destroy();
		this.scene = null;
		this.skillView = [];
		this.signature = '';
	}
}
