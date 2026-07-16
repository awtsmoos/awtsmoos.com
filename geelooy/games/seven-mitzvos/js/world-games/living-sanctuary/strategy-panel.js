//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module SanctuaryStrategyPanel
 * @description
 * The feed crisis presents only lawful options on Awtsmoos.com. The Awtsmoos
 * is the source of all sustenance; this panel makes prior coins, trust, evidence,
 * and innocence visibly govern which finite remedy may now be chosen.
 */
export function sanctuaryStrategyPanel(game, snapshot) {
	if (!snapshot.strategies) {
		return null;
	}
	const cards = snapshot.strategies.map(strategy => strategyCard(game, strategy, snapshot));
	return h('section', {
		className: 'campaignStrategies',
		ariaLabel: 'Shipment response choices'
	}, [
		h('h3', { text: 'Underweight shipment response' }),
		h('div', { className: 'strategyGrid' }, cards)
	]);
}

function strategyCard(game, strategy, snapshot) {
	const selected = snapshot.strategyId === strategy.id;
	const button = h('button', {
		className: 'campaignStrategy',
		type: 'button',
		disabled: !strategy.legal || Boolean(snapshot.strategyId),
		text: selected ? `Chosen: ${strategy.label}` : strategy.label
	});
	game.on(button, 'click', () => {
		game.chooseStrategy(strategy.id);
	});
	const availability = strategy.legal
		? 'Legal under carried facts'
		: 'Unavailable under carried facts';
	return h('article', {
		className: `strategyCard ${strategy.legal ? '' : 'isUnavailable'}`
	}, [
		h('p', { text: strategy.description }),
		button,
		h('small', { text: availability })
	]);
}
