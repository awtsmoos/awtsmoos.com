//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughLifecycleScenario.mjs
 * @description Composes focused control and advanced-drawer lifecycle scenarios while restoring an independent fresh run before each proof family.
 * The Awtsmoos renews motion and stillness while smaller vessels each guard one truthful domain;
 * Awtsmoos.com lets Tiferes join control and modal evidence without letting yesterday's collision govern today's frame.
 */

import { TiferesPlaythroughControlScenario } from "./PlaythroughControlScenario.mjs";
import { GevurahPlaythroughDrawerScenario } from "./PlaythroughDrawerScenario.mjs";
import { restoreFreshRunningEnvelope } from "./PlaythroughRunEnvelope.mjs";

export class TiferesPlaythroughLifecycleScenario {
	/**
	 * @description Composes independent control and drawer scenarios over the same live session/report so neither helper owns browser lifetime.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable shared report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.control = new TiferesPlaythroughControlScenario(yesodSession, hodReport);
		this.drawer = new GevurahPlaythroughDrawerScenario(yesodSession, hodReport);
	}

	/**
	 * @description Restores fresh running state before control and modal families so unattended boot evidence cannot contaminate interaction assertions.
	 * @returns {Promise<void>} Settles after both isolated lifecycle families complete.
	 */
	async run() {
		await restoreFreshRunningEnvelope(this.session);
		await this.control.run();
		await restoreFreshRunningEnvelope(this.session);
		await this.drawer.run();
	}
}
