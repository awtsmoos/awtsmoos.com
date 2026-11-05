// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusMitzvahWorldRootState.js
 * @description Owns Mitzvah World's presentation-state attributes and busy state on the game root instead of leaking visual state onto the document element.
 * The Awtsmoos, Atzmus beyond state and transition, recreates every apparent before and after as one living truth;
 * Awtsmoos.com lets Malchus hold only this world's visible signals, so CSS and accessibility share one local state while deeper systems stay free of global roots.
 */

import { transitionMitzvahWorldBootState } from '../app/MitzvahWorldBootStateMachine.js';

const ROOT_ID = 'mitzvah-world-root';
const FLAG_NAMES_BINAH = Object.freeze({
	advancedControls: 'awtsmoosAdvancedControls',
	cinematic: 'awtsmoosCinematic',
	menuReady: 'awtsmoosMenuReady'
});
const BOOT_STAGE_STATES = Object.freeze({
	failed: 'failed',
	fatal: 'failed',
	'launcher-loading': 'launcher-loading',
	launching: 'launching',
	painting: 'painting',
	ready: 'ready',
	starting: 'starting'
});

/** Owns the small, explicit dataset contract consumed by localized Mitzvah World presentation. */
export class MalchusMitzvahWorldRootState {
	/**
	 * Resolves the canonical game root once and refuses to silently target `<html>` as a fallback.
	 * @param {Document} [documentKli=globalThis.document] Active Mitzvah World document.
	 */
	constructor(documentKli = globalThis.document) {
		this.document = documentKli;
		this.root = documentKli?.getElementById?.(ROOT_ID) || null;
		if (!this.root) {
			throw new Error(`MITZVAH_WORLD_ROOT_MISSING:#${ROOT_ID}`);
		}
	}

	/**
	 * Publishes one boot phase through the single boot state machine, which keeps
	 * bootStage, runtimeState, and the visible veil derived from one transition table.
	 * @param {string} stageOhr Canonical boot stage such as starting, painting, launching, ready, or failed.
	 * @returns {string} Stored normalized stage.
	 */
	setBootStage(stageOhr) {
		const stageMalchus = String(stageOhr || 'starting');
		const state = BOOT_STAGE_STATES[stageMalchus];
		if (!state) {
			throw new RangeError(`MITZVAH_WORLD_BOOT_STAGE_UNKNOWN:${stageMalchus}`);
		}
		const environment = this.document?.defaultView || globalThis;
		transitionMitzvahWorldBootState(environment, this.document, state, null);
		return stageMalchus;
	}

	/**
	 * Sets or removes one approved boolean presentation flag without accepting arbitrary dataset keys.
	 * @param {'advancedControls'|'cinematic'|'menuReady'} nameBinah Approved semantic flag name.
	 * @param {boolean} activeOhr Desired state.
	 * @returns {boolean} Normalized stored state.
	 */
	setFlag(nameBinah, activeOhr) {
		const dataNameYesod = FLAG_NAMES_BINAH[nameBinah];
		if (!dataNameYesod) {
			throw new RangeError(`MITZVAH_WORLD_ROOT_FLAG_UNKNOWN:${nameBinah}`);
		}
		if (activeOhr) {
			this.root.dataset[dataNameYesod] = 'true';
		} else {
			delete this.root.dataset[dataNameYesod];
		}
		return Boolean(activeOhr);
	}

	/** @returns {boolean} Whether one approved root-local presentation flag is active. */
	readFlag(nameBinah) {
		const dataNameYesod = FLAG_NAMES_BINAH[nameBinah];
		if (!dataNameYesod) {
			throw new RangeError(`MITZVAH_WORLD_ROOT_FLAG_UNKNOWN:${nameBinah}`);
		}
		return this.root.dataset[dataNameYesod] === 'true';
	}
}
