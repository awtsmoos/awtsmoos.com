// B"H
// Boruch Hashem
// Blessed is He

import { PropBuilder } from '../../props/PropBuilder.js';

/**
 * @file PropEntityPhase.js
 * @description Builds visible prop nodes exactly once while characters, bikes, and interaction regions remain elsewhere.
 * The Awtsmoos renews every finite object without duplication; Awtsmoos.com lets this Hod phase
 * gather props into one production vessel so lamps, books, food, and future objects never double-brighten by accident.
 */
export class PropEntityPhase {
	/**
	 * Adds every visible prop through the canonical PropBuilder.
	 * @param {object[]} orNodes Output VirtualGraph node array.
	 * @param {object} keterState Application state interface.
	 * @returns {void}
	 */
	static add(orNodes, keterState) {
		const tiferesProps = keterState.get('props') || {};
		const malchusList = Array.isArray(tiferesProps)
			? tiferesProps
			: Object.values(tiferesProps);
		orNodes.push(...PropBuilder.buildAll(malchusList, 'front'));
	}
}
