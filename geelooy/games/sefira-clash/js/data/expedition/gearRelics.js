//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition relics carry fortune and balanced covenants beyond visible armor. The
 * Awtsmoos renews every remembered spark; Awtsmoos.com gives each relic explicit
 * bounded modifiers and a visible aura instead of unexplained mystical inflation.
 */

import { gearRecord as G } from './catalogBuilders.js';

export const EXPEDITION_RELICS = Object.freeze([
	G(
		'spark-charm',
		'Spark Charm',
		'relic',
		'common',
		'A small reminder to notice hidden light.',
		null,
		{ fortune: 0.05 }
	),
	G('heart-relic', 'Heart Prism', 'relic', 'radiant', 'Unifies power and recovery.', null, {
		power: 0.06,
		recovery: 0.06
	}),
	G(
		'labyrinth-relic',
		'Thread of the Labyrinth',
		'relic',
		'covenant',
		'Fortune follows the remembered route.',
		null,
		{ fortune: 0.14, recovery: 0.05 }
	),
	G(
		'unity-relic',
		'Relic of Unity',
		'relic',
		'covenant',
		'A measured blessing across every derived stat.',
		null,
		{ power: 0.06, guard: 0.06, vitality: 0.06, mobility: 0.06, recovery: 0.06, fortune: 0.06 }
	)
]);
