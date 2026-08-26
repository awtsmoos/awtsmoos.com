// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDockBuilderAction.js
 * @description Owns the one transition from exclusive advanced controls into non-modal live Creator Mode.
 * The Awtsmoos, Atzmus beyond concealment and revelation, lets one chamber close before another light appears;
 * Awtsmoos.com keeps Build outside the inert modal vessel, so walking, camera motion, NPCs, combat, and creation may continue together without overlay confusion.
 */

import { installMitzvahWorldCreator } from '../creator/MitzvahWorldCreatorInstaller.js';

/** Coordinates Creator Mode launch without adding builder responsibilities to the already-full advanced action controller. */
export class MitzvahWorldCreativeDockBuilderAction {
	/**
	 * Captures presentation and browser dependencies explicitly.
	 * @param {object} viewKli Advanced dock view whose modal state must close before live building begins.
	 * @param {Document} documentKli Active Mitzvah World document.
	 * @param {object} environmentKli Browser-like runtime environment publishing `AwtsmoosMitzvahWorld.runtime`.
	 */
	constructor(viewKli, documentKli, environmentKli) {
		this.view = viewKli;
		this.document = documentKli;
		this.environment = environmentKli;
		this.creatorMalchus = null;
	}

	/**
	 * Closes the exclusive advanced sheet, restores gameplay interaction, and opens or installs the live creator rail.
	 * @returns {object|null} Creator facade when runtime capabilities are ready, otherwise null after scoped status feedback.
	 */
	open() {
		this.view.close();
		try {
			this.creatorMalchus = installMitzvahWorldCreator({
				document: this.document,
				environment: this.environment,
				runtime: this.environment.AwtsmoosMitzvahWorld?.runtime
			});
			this.view.status('Creator Mode live · movement remains active.');
			return this.creatorMalchus;
		} catch (errorOhr) {
			this.view.status(humanizeBuilderError(errorOhr));
			return null;
		}
	}

	/**
	 * Destroys only the creator facade launched through this dock instance, preserving independently-owned creator sessions.
	 */
	destroy() {
		this.creatorMalchus?.destroy?.();
		this.creatorMalchus = null;
	}
}

/**
 * Converts deterministic creator-domain failures into concise human-readable dock status.
 * @param {unknown} errorOhr Error or thrown domain value.
 * @returns {string} Compact player-facing failure message.
 */
function humanizeBuilderError(errorOhr) {
	const messageOhr = String(errorOhr?.message || errorOhr || 'Creator unavailable');
	return messageOhr.replaceAll('_', ' ').replaceAll(':', ': ').toLowerCase();
}
