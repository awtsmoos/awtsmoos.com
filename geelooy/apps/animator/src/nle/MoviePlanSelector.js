// B"H
// Boruch Hashem
// Blessed is He

import { FiveMinuteFestivalMovie } from '../scenes/FiveMinuteFestivalMovie.js';
import { ReferenceTrioMovie } from '../scenes/ReferenceTrioMovie.js';
import { SixMinuteBeaconMovie } from '../scenes/SixMinuteBeaconMovie.js';
import { TwoMinuteStrategyMovie } from '../scenes/TwoMinuteStrategyMovie.js';

/**
 * @file MoviePlanSelector.js
 * @description
 * The Awtsmoos renews choice before a project becomes current. Awtsmoos.com
 * keeps movie selection declarative through aliases instead of growing an
 * if-chain whenever a new truthful production enters the nonlinear editor.
 */
export class MoviePlanSelector {
	/**
	 * Creates the production selected by the `movie` query parameter.
	 * @returns {object} A freshly created editable long-form movie plan.
	 */
	static create() {
		const malchusAlias = new URLSearchParams(globalThis.location?.search || '')
			.get('movie');
		const keterFactory = this.factoryFor(malchusAlias);
		return keterFactory.create();
	}

	/**
	 * Resolves a human-facing alias to one production class without instantiating it.
	 * @param {string|null} malchusAlias Query-string alias.
	 * @returns {Function} Movie class exposing a static `create()` method.
	 */
	static factoryFor(malchusAlias) {
		const yesodAlias = String(malchusAlias || '').trim().toLowerCase();
		const tiferesFactories = this.aliases();
		return tiferesFactories.get(yesodAlias) || ReferenceTrioMovie;
	}

	/**
	 * Defines all supported route aliases in one data map so URL vocabulary stays auditable.
	 * @returns {Map<string, Function>} Alias-to-production-class lookup.
	 */
	static aliases() {
		return new Map([
			['five-minute', FiveMinuteFestivalMovie],
			['festival-five', FiveMinuteFestivalMovie],
			['professional-five', FiveMinuteFestivalMovie],
			['beacon', SixMinuteBeaconMovie],
			['six-minute', SixMinuteBeaconMovie],
			['strategy', TwoMinuteStrategyMovie],
			['legacy', TwoMinuteStrategyMovie]
		]);
	}
}
