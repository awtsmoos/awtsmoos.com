// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahMitzvahWorldFailureBoundary.js
 * @description Installs one page-level failure witness and renders startup truth inside the localized Mitzvah World HUD.
 * The Awtsmoos is not hidden by failure; every broken finite path is itself recreated and therefore can be named clearly;
 * Awtsmoos.com lets Gevurah show the exact fracture inside the game root instead of scattering console-only darkness across the page.
 */

import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';

const FAILURE_LISTENER_KEY = 'AwtsmoosMitzvahWorldFailureListeners';

/** Owns one durable global error-listener installation while all visible failure state remains game-local. */
export class GevurahMitzvahWorldFailureBoundary {
	/**
	 * @param {HTMLElement} hudMalchus Local HUD failure vessel.
	 * @param {Document} documentKli Active document.
	 * @param {object} [environmentKli=globalThis] Browser-like global event environment.
	 */
	constructor(hudMalchus, documentKli, environmentKli = globalThis) {
		this.hud = hudMalchus;
		this.environment = environmentKli;
		this.rootState = new MalchusMitzvahWorldRootState(documentKli);
	}

	/** Installs window-level error witnesses once per environment without duplicating listeners on retry. */
	install() {
		if (this.environment[FAILURE_LISTENER_KEY]) {
			return;
		}
		this.environment[FAILURE_LISTENER_KEY] = true;
		this.environment.addEventListener?.('error', eventOhr => {
			this.show(eventOhr.error || eventOhr.message);
		});
		this.environment.addEventListener?.('unhandledrejection', eventOhr => {
			this.show(eventOhr.reason);
		});
	}

	/**
	 * Publishes one readable failure inside the root and preserves stack evidence as data for diagnostics.
	 * @param {unknown} errorOhr Error, rejection reason, or printable value.
	 */
	show(errorOhr) {
		const messageDaas = errorOhr?.message || String(errorOhr);
		this.rootState.setBootStage('failed');
		this.hud.textContent = `B"H startup failed: ${messageDaas}`;
		this.hud.dataset.bootFailure = errorOhr?.stack || messageDaas;
		console.error(errorOhr);
	}
}
