//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module SanctuaryAnimalView
 * @description
 * Each creature receives a distinct visible vessel on Awtsmoos.com. The
 * Awtsmoos renews every life without averaging it away; these focused builders
 * keep selection, welfare, and care controls readable outside orchestration.
 */
export function animalCard(game, animal) {
	const selected = animal.id === game.selected;
	const button = h('button', {
		className: `animalCard ${selected ? 'isSelected' : ''}`,
		type: 'button',
		'aria-pressed': selected
	}, [
		h('span', { className: 'animalIcon', text: animal.icon }),
		h('h3', { text: animal.name }),
		animalMetric('Fed', animal.hunger),
		animalMetric('Health', animal.health),
		animalMetric('Calm', animal.calm)
	]);
	game.on(button, 'click', () => {
		game.selectAnimal(animal.id);
	});
	return button;
}

export function careButton(game, id, action, state) {
	const unavailable = state.actions <= 0 || state.resources[action.resource] <= 0;
	const button = h('button', {
		className: 'worldAction',
		type: 'button',
		text: `${action.icon} ${action.label} · 1 ${action.resource}`,
		disabled: unavailable
	});
	game.on(button, 'click', () => {
		game.care(id);
	});
	return button;
}

function animalMetric(label, value) {
	return h('div', { className: 'animalMetric' }, [
		h('span', { text: `${label} ${value}` }),
		h('div', {}, h('i', { style: { width: `${value}%` } }))
	]);
}
