//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';
import { CARE_ACTIONS } from './data.js';
import { animalCard, careButton } from './animal-view.js';
import { sanctuaryStrategyPanel } from './strategy-panel.js';

/**
 * @module SanctuaryGameView
 * @description
 * Rendering becomes a separate vessel on Awtsmoos.com. The Awtsmoos joins soul
 * and body without confusion; this view shows animals, strategies, resources,
 * and the weakest life while orchestration remains small and accountable.
 */
export function createSanctuaryView(game) {
	game.strategyHost = h('div', { className: 'campaignStrategyHost' });
	game.animalGrid = h('div', { className: 'sanctuaryGrid' });
	game.actionRow = h('div', { className: 'worldActionRow' });
	game.dayButton = actionButton('Advance sanctuary day');
	game.upgradeButton = actionButton('Expand habitat');
	game.on(game.dayButton, 'click', () => {
		game.advanceDay();
	});
	game.on(game.upgradeButton, 'click', () => {
		game.upgrade();
	});
	game.portal.body(
		h('div', {
			className: 'worldInstructions',
			text: 'Select an animal. Spend limited care resources. The weakest animal remains visible.'
		}),
		game.strategyHost,
		game.animalGrid,
		game.actionRow,
		h('div', { className: 'worldActionRow' }, [game.dayButton, game.upgradeButton])
	);
}

export function renderSanctuaryView(game, state) {
	const strategy = sanctuaryStrategyPanel(game, state);
	game.strategyHost.replaceChildren(...(strategy ? [strategy] : []));
	game.animalGrid.replaceChildren(...state.animals.map(animal => {
		return animalCard(game, animal);
	}));
	const actions = Object.entries(CARE_ACTIONS).map(([id, action]) => {
		return careButton(game, id, action, state);
	});
	game.actionRow.replaceChildren(...actions);
	updateUpgrade(game, state);
	updateHud(game, state);
}

function actionButton(text) {
	return h('button', {
		className: 'worldAction',
		type: 'button',
		text
	});
}

function updateUpgrade(game, state) {
	const complete = state.habitat >= 3;
	game.upgradeButton.textContent = complete
		? 'Habitat complete'
		: `Expand habitat · ${state.habitat + 2} materials`;
	game.upgradeButton.disabled = complete || state.habitatDelayed === true;
}

function updateHud(game, state) {
	const values = {
		Day: `${state.day}/${state.totalDays}`,
		Actions: state.actions,
		Food: state.resources.food,
		Medicine: state.resources.medicine,
		Calm: state.resources.calm,
		Materials: state.resources.materials,
		Welfare: `${Math.round(state.welfare)}%`
	};
	if (Number.isFinite(state.weakest)) {
		values.Weakest = `${state.weakest}%`;
	}
	game.portal.hud(values);
}
