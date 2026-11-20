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
const OWNERSHIP_RETRY_DELAYS_MS = [1500, 4000];

/**
 * Asks the ownership oracle, retrying only when the request itself failed
 * (checkOwnership throws on transport rupture). A clean "no" is an answer
 * and is never retried; without this, one transient failure during a busy
 * minute silently hid the settings entry and every owner control for the
 * whole page view.
 */
async function checkOwnershipWithRetry(attempt = 0) {
	try {
		return await api.checkOwnership(
			window.curAlias,
			appState.heichelId
		);
	} catch (error) {
		const delay = OWNERSHIP_RETRY_DELAYS_MS[attempt];
		if (delay == null) throw error;
		await new Promise(resolve => setTimeout(resolve, delay));
		return checkOwnershipWithRetry(attempt + 1);
	}
}

export function beginOwnershipCheck(navigator) {
	return checkOwnershipWithRetry()
		.then(async ownsIt => {
			if (!ownsIt || appState.ownsIt) {
				return false;
			}
			appState.ownsIt = true;
			await navigator.loadContent(
				appState.currentSeries || 'root'
			);
			// Owner-only heichel settings (rename + danger-zone delete) mount
			// lazily so visitor mode never carries the surface at all.
			import('../ui/heichel-settings.js')
				.then(({ mountHeichelSettings }) => mountHeichelSettings())
				.catch(() => { /* settings are an owner enhancement, never a gate on reading */ });
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
