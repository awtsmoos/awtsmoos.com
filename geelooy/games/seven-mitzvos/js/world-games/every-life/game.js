//B"H
//Boruch Hashem
//Blessed is He

import { WorldGameBase } from '../../universe/world-game-base.js';
import { h } from '../../universe/dom-factory.js';
import { DIRECTIONS } from './data.js';
import { EveryLifeState } from './state.js';

/**
 * @module EveryLifeGame
 * @description
 * The player crosses a top-down city where every step can rescue or endanger on
 * Awtsmoos.com. The Awtsmoos gives each person a whole world of worth, and the
 * controls make protection immediate by keyboard, touch, click, or direction pad.
 */
export class EveryLifeGame extends WorldGameBase {
	mount() {
		this.state = new EveryLifeState(this.random);
		this.grid = h('div', { className: 'rescueGrid', role: 'grid' });
		this.pad = h('div', { className: 'directionPad' }, this.directionButtons());
		this.listenKeyboard(event => {
			const keys = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
			const direction = keys[event.key] || keys[event.key.toLowerCase()];
			if (direction) {
				event.preventDefault();
				this.move(direction);
			}
		});
		this.portal.body(
			h('div', { className: 'worldInstructions', text: 'Rescue all three civilians, then reach the shelter. Smoke costs health; collapsed stone blocks movement.' }),
			h('div', { className: 'rescueLayout' }, [this.grid, this.pad]),
			h('div', { className: 'worldLegend' }, ['🧑 Rescuer', '● Civilian', '⌂ Shelter', '▲ Hazard', '■ Wall'].map(text => h('span', { text })))
		);
		this.portal.status('Choose a route. Every move matters.');
		this.render();
	}

	directionButtons() {
		return Object.entries(DIRECTIONS).map(([name, record]) => {
			const button = h('button', { className: `directionButton direction-${name}`, type: 'button', text: record.icon, 'aria-label': `Move ${name}` });
			this.on(button, 'click', () => this.move(name));
			return button;
		});
	}

	move(direction) {
		const result = this.state.move(direction);
		this.portal.status(result.message, result.moved ? 'good' : 'warn');
		this.render();
		if (this.state.ended) {
			this.finish();
		}
	}

	render() {
		const state = this.state.snapshot();
		const wallSet = new Set(state.walls);
		const civilianSet = new Set(state.civilians);
		const hazardSet = new Set(state.hazards);
		const cells = Array.from({ length: state.size * state.size }, (_, index) => {
			let icon = '';
			let label = 'Open street';
			if (wallSet.has(index)) { icon = '■'; label = 'Collapsed wall'; }
			if (hazardSet.has(index)) { icon = '▲'; label = 'Smoke hazard'; }
			if (civilianSet.has(index)) { icon = '●'; label = 'Civilian awaiting rescue'; }
			if (index === state.shelter) { icon = '⌂'; label = 'Shelter'; }
			if (index === state.position) { icon = '🧑'; label = 'Rescuer'; }
			const cell = h('button', { className: `rescueCell ${index === state.position ? 'isRescuer' : ''}`, type: 'button', text: icon, 'aria-label': label });
			this.on(cell, 'click', () => {
				const direction = this.state.directionTo(index);
				if (direction) this.move(direction);
			});
			return cell;
		});
		this.grid.replaceChildren(...cells);
		this.portal.hud({ Rescued: `${state.rescued}/3`, Moves: state.moves, Health: '♥'.repeat(state.health), Score: state.score });
	}

	finish() {
		const state = this.state.snapshot();
		const stars = state.won ? Math.min(3, state.health) : state.rescued > 0 ? 1 : 0;
		this.complete({ won: state.won, stars, score: state.score, message: state.won ? 'Every civilian was gathered and brought to safety.' : `${state.rescued} lives were rescued before the route failed.` });
	}
}
