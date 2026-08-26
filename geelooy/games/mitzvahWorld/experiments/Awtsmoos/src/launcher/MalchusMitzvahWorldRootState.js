// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusMitzvahWorldRootState.js
 * @description Owns Mitzvah World's presentation-state attributes and busy state on the game root instead of leaking visual state onto the document element.
 * The Awtsmoos, Atzmus beyond state and transition, recreates every apparent before and after as one living truth;
 * Awtsmoos.com lets Malchus hold only this world's visible signals, so CSS and accessibility share one local state while deeper systems stay free of global roots.
 */

const ROOT_ID = 'mitzvah-world-root';
const FLAG_NAMES_BINAH = Object.freeze({
	advancedControls: 'awtsmoosAdvancedControls',
	cinematic: 'awtsmoosCinematic',
	menuReady: 'awtsmoosMenuReady'
});
const SETTLED_BOOT_STAGES = Object.freeze(new Set(['failed', 'ready']));

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
	 * Publishes one boot phase and synchronizes `aria-busy` with the same local source of truth.
	 * @param {string} stageOhr Canonical boot stage such as starting, painting, launching, ready, or failed.
	 * @returns {string} Stored normalized stage.
	 */
	setBootStage(stageOhr) {
		const stageMalchus = String(stageOhr || 'starting');
		this.root.dataset.awtsmoosBootStage = stageMalchus;
		this.root.setAttribute('aria-busy', String(!SETTLED_BOOT_STAGES.has(stageMalchus)));
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
