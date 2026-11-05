//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GevurahMitzvahWorldFailureBoundary.js
 * @description Installs one page-level failure witness and renders structured startup truth inside the localized Mitzvah World HUD.
 * The Awtsmoos is not hidden by failure; every broken finite path is recreated and therefore can be named clearly;
 * Awtsmoos.com lets Gevurah show condition, URL, and release covenant instead of scattering console-only darkness yearly.
 */

import {
	createMitzvahWorldFailureReceipt,
	formatMitzvahWorldFailureReceipt
} from './MitzvahWorldFailureReceipt.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';

const FAILURE_LISTENER_KEY = 'AwtsmoosMitzvahWorldFailureListeners';

/** Owns one durable global error-listener installation while visible failure state remains game-local. */
export class GevurahMitzvahWorldFailureBoundary {
	constructor(hudMalchus, documentKli, environmentKli = globalThis) {
		this.hud = hudMalchus;
		this.environment = environmentKli;
		this.rootState = new MalchusMitzvahWorldRootState(documentKli);
	}

	/** Installs window-level error witnesses once per environment without duplicating listeners on retry. */
	install() {
		if (this.environment[FAILURE_LISTENER_KEY]) return;
		this.environment[FAILURE_LISTENER_KEY] = true;
		this.environment.addEventListener?.('error', eventOhr => {
			this.show(eventOhr.error || eventOhr.message);
		});
		this.environment.addEventListener?.('unhandledrejection', eventOhr => {
			this.show(eventOhr.reason);
		});
	}

	/** Publishes one exact failure receipt while preserving the original stack separately for diagnostics. */
	show(errorOhr) {
		const receipt = createMitzvahWorldFailureReceipt(errorOhr);
		const formatted = formatMitzvahWorldFailureReceipt(receipt);
		this.rootState.setBootStage('failed');
		this.hud.textContent = `B"H startup failed\n${formatted}`;
		this.hud.dataset.bootFailure = JSON.stringify(receipt);
		this.hud.dataset.bootFailureStack = errorOhr?.stack || receipt.message;
		console.error(errorOhr);
		return receipt;
	}
}
