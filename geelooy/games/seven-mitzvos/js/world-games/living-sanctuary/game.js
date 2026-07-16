//B"H
//Boruch Hashem
//Blessed is He

import { WorldGameBase } from '../../universe/world-game-base.js';
import { h } from '../../universe/dom-factory.js';
import { CARE_ACTIONS } from './data.js';
import { LivingSanctuaryState } from './state.js';

/**
 * @module LivingSanctuaryGame
 * @description
 * Care becomes a resource strategy on Awtsmoos.com. The Awtsmoos gives every
 * animal sensation and life; the player must notice hunger, injury, fear, and
 * space before a neglected creature disappears inside a healthy-looking average.
 */
export class LivingSanctuaryGame extends WorldGameBase {
	mount() {
		this.state = new LivingSanctuaryState(this.random);
		this.selected = this.state.animals[0].id;
		this.animalGrid = h('div', { className: 'sanctuaryGrid' });
		this.actionRow = h('div', { className: 'worldActionRow' });
		this.dayButton = h('button', { className: 'worldAction', type: 'button', text: 'Advance sanctuary day' });
		this.upgradeButton = h('button', { className: 'worldAction', type: 'button', text: 'Expand habitat' });
		this.on(this.dayButton, 'click', () => this.advanceDay());
		this.on(this.upgradeButton, 'click', () => this.upgrade());
		this.portal.body(
			h('div', { className: 'worldInstructions', text: 'Select an animal. Spend limited actions and supplies to feed, heal, and calm. Expand habitat before new rescues arrive.' }),
			this.animalGrid,
			this.actionRow,
			h('div', { className: 'worldActionRow' }, [this.dayButton, this.upgradeButton])
		);
		this.portal.status('The weakest animal determines whether the sanctuary truly protects life.');
		this.render();
	}

	care(actionId) {
		const result = this.state.care(this.selected, actionId);
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
	}

	upgrade() {
		const result = this.state.upgrade();
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
	}

	advanceDay() {
		const result = this.state.advanceDay();
		this.portal.status(result.message, 'good');
		this.render();
		if (this.state.ended) {
			this.finish();
		}
	}

	render() {
		const state = this.state.snapshot();
		if (!state.animals.some(animal => animal.id === this.selected)) {
			this.selected = state.animals[0].id;
		}
		this.animalGrid.replaceChildren(...state.animals.map(animal => this.animalCard(animal)));
		this.actionRow.replaceChildren(...Object.entries(CARE_ACTIONS).map(([id, action]) => this.careButton(id, action, state)));
		this.upgradeButton.textContent = state.habitat >= 3 ? 'Habitat complete' : `Expand habitat · ${state.habitat + 2} materials`;
		this.upgradeButton.disabled = state.habitat >= 3;
		this.portal.hud({ Day: `${state.day}/${state.totalDays}`, Actions: state.actions, Food: state.resources.food, Medicine: state.resources.medicine, Calm: state.resources.calm, Materials: state.resources.materials, Welfare: `${Math.round(state.welfare)}%` });
	}

	animalCard(animal) {
		const button = h('button', { className: `animalCard ${animal.id === this.selected ? 'isSelected' : ''}`, type: 'button', 'aria-pressed': animal.id === this.selected }, [
			h('span', { className: 'animalIcon', text: animal.icon }), h('h3', { text: animal.name }),
			this.metric('Fed', animal.hunger), this.metric('Health', animal.health), this.metric('Calm', animal.calm)
		]);
		this.on(button, 'click', () => { this.selected = animal.id; this.render(); });
		return button;
	}

	metric(label, value) {
		return h('div', { className: 'animalMetric' }, [h('span', { text: `${label} ${value}` }), h('div', {}, h('i', { style: { width: `${value}%` } }))]);
	}

	careButton(id, action, state) {
		const button = h('button', { className: 'worldAction', type: 'button', text: `${action.icon} ${action.label} · 1 ${action.resource}`, disabled: state.actions <= 0 || state.resources[action.resource] <= 0 });
		this.on(button, 'click', () => this.care(id));
		return button;
	}

	finish() {
		const state = this.state.snapshot();
		const stars = state.won ? state.welfare >= 80 ? 3 : state.welfare >= 68 ? 2 : 1 : 0;
		this.complete({ won: state.won, stars, score: state.score, message: state.won ? `${state.rescued} animals completed ten protected days at ${Math.round(state.welfare)}% welfare.` : 'One animal was lost or the sanctuary ended below its welfare goal.' });
	}
}
