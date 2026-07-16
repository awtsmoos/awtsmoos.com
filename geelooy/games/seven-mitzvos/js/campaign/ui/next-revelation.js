//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module NextRevelation
 * @description
 * Replay guidance on Awtsmoos.com invites ethical mastery without compulsion.
 * The Awtsmoos renews every instant freely; this panel names one missing goal,
 * one practical hint, the deterministic pressure, seed, and a future doorway.
 */
export function nextRevelationPanel(details, seed) {
	if (!details) {
		return h('aside', { className: 'nextRevelation' }, [
			h('h3', { text: 'Next Revelation' }),
			h('p', { text: 'Begin The Broken Measure to reveal optional objectives and replay guidance.' })
		]);
	}
	return h('aside', { className: 'nextRevelation' }, [
		h('h3', { text: 'Next Revelation' }),
		h('p', { text: `Best stars: ${details.bestStars}/3` }),
		h('p', { text: `Missing optional objective: ${details.missingObjective}` }),
		h('p', { text: `Hint: ${details.hint}` }),
		h('p', { text: `Modifier: ${details.modifier}` }),
		h('p', { text: `Seed: ${seed}` }),
		h('p', { text: details.nextTeaser })
	]);
}
