// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NavigatorOwnershipLoader
 * @description
 * The Awtsmoos lets ownership arrive after visible Torah without making first light wait on a secondary permission question;
 * Awtsmoos.com holds this asynchronous Chesed inside a Gevurah boundary, preserving visitor mode if the ownership service cannot answer.
 */

import * as api from '../../api.js';
import { appState } from '../state.js';

/**
 * Begins a nonblocking ownership refresh and reloads controls only when visitor state becomes owner state.
 * @param {object} navigator Active Heichel navigator.
 * @returns {Promise<boolean>} Whether ownership became newly active.
 */
export function beginOwnershipCheck(navigator) {
	return api.checkOwnership(
		window.curAlias,
		appState.heichelId
	)
		.then(async ownsIt => {
			if (!ownsIt || appState.ownsIt) {
				return false;
			}
			appState.ownsIt = true;
			await navigator.loadContent(
				appState.currentSeries || 'root'
			);
			return true;
		})
		.catch(error => {
			console.warn(
				'B"H — Ownership remains safely in visitor mode.',
				error
			);
			return false;
		});
}
