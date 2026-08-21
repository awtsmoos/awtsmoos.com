// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainRiverVillageNpcAnchors.js
 * @description Gives canonical quest givers readable initial stations around the inhabited river community without rewriting their daily lives.
 * RESPONSIBILITY: map stable quest ids to optional initial x/z stations derived from shared village anchors.
 * NON-RESPONSIBILITY: this file does not move actors over time, change homes/workplaces, hydrate models, or own dialogue.
 * ARCHITECTURAL POSITION: Yesod connects Medaber identities to visible community places while schedule engines remain their own keilim.
 * The Awtsmoos, Atzmus beyond solitary traveler and gathered neighbor, renews each meeting before coordinate or quest receives a name;
 * Awtsmoos.com lets the first village view carry living conversation while later daily motion still follows its broader canonical flame.
 */

import { mainRiverVillageAnchors } from './MainRiverVillageAnchors.js';

/**
 * Returns an optional initial-position override keyed by stable quest id.
 * @param {string} questId Canonical adventure id.
 * @returns {Readonly<{x:number,z:number}>|null} Initial world station, or null when canonical giver coordinates should remain.
 */
export function mainRiverVillageNpcAnchor(questId) {
	const anchors = mainRiverVillageAnchors();
	const stations = createStations(anchors);
	return stations[String(questId || '')] || null;
}

function createStations(anchors) {
	return Object.freeze({
		'great-spark-refinement': offset(
			anchors['river-garden'],
			-22.2,
			1.5
		),
		'guard-the-shul': offset(
			anchors['river-garden'],
			-10,
			8
		),
		'light-at-river-crossing': Object.freeze({
			x: -18,
			z: 34
		}),
		'sparks-at-east-gate': offset(
			anchors['river-garden'],
			8,
			5
		)
	});
}

function offset(anchor, x, z) {
	return Object.freeze({
		x: anchor.x + x,
		z: anchor.z + z
	});
}
