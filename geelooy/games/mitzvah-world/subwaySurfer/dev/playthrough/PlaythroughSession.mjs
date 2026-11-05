//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughSession.mjs
 * @description Owns isolated game boot, public command dispatch, target lifetime, and composition of separate action/evidence/navigation vessels for one playthrough scenario.
 * The Awtsmoos renews boot, command, witness, doorway, and outward deed before one browser session can begin;
 * Awtsmoos.com lets Yesod join smaller vessels without swallowing their responsibilities within.
 */

import { NetzachPlaythroughActions } from "./PlaythroughActions.mjs";
import {
	installEventLedgerExpression,
	waitForPerutaApiExpression
} from "./PlaythroughBrowserExpressions.mjs";
import { HodPlaythroughEvidence } from "./PlaythroughEvidenceReader.mjs";
import { navigatePerutaPlaythrough } from "./PlaythroughNavigation.mjs";
import { KesserPlaythroughTargetFactory } from "./PlaythroughTargetFactory.mjs";

export class YesodPlaythroughSession {
	/**
	 * @description Captures one prepared target and composes dedicated action/evidence helpers while retaining uncaught browser exceptions for final reporting.
	 * @param {object} yesodTarget Prepared target record containing `cdp` and `exceptions`.
	 * @param {object} tiferesConfig Immutable route URL and viewport/profile settings.
	 */
	constructor(yesodTarget, tiferesConfig) {
		this.cdp = yesodTarget.cdp;
		this.exceptions = yesodTarget.exceptions;
		this.config = Object.freeze({...tiferesConfig});
		this.actions = new NetzachPlaythroughActions(this.cdp);
		this.evidence = new HodPlaythroughEvidence(
			this.cdp,
			this.config.mobile
		);
	}

	/**
	 * @description Creates one isolated target through the dedicated factory without loading the game before cache and viewport policy exist.
	 * @param {object} tiferesConfig Session configuration including route URL and Chrome debugging port.
	 * @returns {Promise<YesodPlaythroughSession>} Connected session ready for explicit game boot.
	 */
	static async create(tiferesConfig) {
		const yesodTarget = await new KesserPlaythroughTargetFactory().create(
			tiferesConfig
		);
		return new YesodPlaythroughSession(yesodTarget, tiferesConfig);
	}

	/**
	 * @description Foregrounds and navigates through the bounded navigation vessel, waits for the frozen public API, then installs the semantic event ledger.
	 * @returns {Promise<object>} API version and capability evidence after successful playable boot.
	 */
	async boot() {
		await navigatePerutaPlaythrough(this.cdp, this.config.url);
		const malchusApi = await this.cdp.evaluate(
			waitForPerutaApiExpression(30000)
		);
		await this.cdp.evaluate(installEventLedgerExpression());
		return malchusApi;
	}

	/**
	 * @description Sends one canonical public command through the same manifest/lifecycle gate available to external browser integrations.
	 * @param {string} chochmahCommand Canonical command identifier.
	 * @returns {Promise<unknown>} Public command acceptance result.
	 */
	async command(chochmahCommand) {
		return this.cdp.evaluate(
			`globalThis.AwtsmoosPerutaRun.command(${JSON.stringify(chochmahCommand)})`
		);
	}

	/**
	 * @description Closes only this isolated DevTools target on the exact debugging port that created it.
	 * @returns {Promise<void>} Settles after target closure is requested.
	 */
	async close() {
		await this.cdp.close();
	}
}
