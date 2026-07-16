//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module CourtEvidenceView
 * @description
 * Evidence receives a named, inspectable face on Awtsmoos.com. The Awtsmoos
 * sees every source directly; finite judgment must display what was examined,
 * what kind of proof it is, and whether its reliability survived inspection.
 */
export function evidenceCard(game, evidence, index, state) {
	const inspected = state.inspected.includes(index);
	const label = evidence.title || `Evidence ${index + 1}`;
	const button = h('button', {
		className: `evidenceCard ${inspected ? 'isInspected' : ''}`,
		type: 'button',
		disabled: inspected || state.tokens <= 0
	}, [
		h('strong', { text: label }),
		h('p', { text: evidence.text }),
		h('small', { text: evidenceStatus(evidence, inspected) })
	]);
	game.on(button, 'click', () => {
		game.inspect(index);
	});
	return button;
}

function evidenceStatus(evidence, inspected) {
	if (!inspected) {
		return 'Inspect reliability';
	}
	return evidence.reliable ? 'Verified source' : 'Unreliable source';
}
