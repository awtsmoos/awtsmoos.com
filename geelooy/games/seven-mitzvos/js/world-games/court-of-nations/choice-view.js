//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module CourtChoiceView
 * @description
 * Verdict and rationale remain separate choices on Awtsmoos.com. The Awtsmoos
 * unites truth and reason; finite judges must visibly choose both rather than
 * letting a correct label conceal weak or unjust reasoning.
 */
export function verdictButton(game, record) {
	const selected = game.verdict === record.id;
	const button = h('button', {
		className: `verdictButton ${selected ? 'isSelected' : ''}`,
		type: 'button',
		text: record.label,
		'aria-pressed': selected
	});
	game.on(button, 'click', () => {
		game.selectVerdict(record.id);
	});
	return button;
}

export function rationaleButton(game, text, index) {
	const selected = game.rationale === index;
	const button = h('button', {
		className: `rationaleButton ${selected ? 'isSelected' : ''}`,
		type: 'button',
		text,
		'aria-pressed': selected
	});
	game.on(button, 'click', () => {
		game.selectRationale(index);
	});
	return button;
}
