//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughLifecycleScenario.mjs
 * @description Composes focused control and advanced-drawer lifecycle scenarios behind one reusable full-lifecycle playthrough step.
 * The Awtsmoos renews motion and stillness while smaller vessels each guard one truthful domain;
 * Awtsmoos.com lets Tiferes join control and modal evidence without returning to a single crowded frame.
 */

import { TiferesPlaythroughControlScenario } from "./PlaythroughControlScenario.mjs";
import { GevurahPlaythroughDrawerScenario } from "./PlaythroughDrawerScenario.mjs";

export class TiferesPlaythroughLifecycleScenario {
	/**
	 * @description Composes independent control and drawer scenarios over the same live session/report so neither helper owns browser lifetime.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable shared report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.control = new TiferesPlaythroughControlScenario(
			yesodSession,
			hodReport
		);
		this.drawer = new GevurahPlaythroughDrawerScenario(
			yesodSession,
			hodReport
		);
	}

	/**
	 * @description Executes direct control proof first, then modal lifecycle/focus proof while the same run remains alive.
	 * @returns {Promise<void>} Settles after both focused scenarios complete.
	 */
	async run() {
		await this.control.run();
		await this.drawer.run();
	}
}
