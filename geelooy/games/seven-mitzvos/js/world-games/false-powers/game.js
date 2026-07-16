//B"H
//Boruch Hashem
//Blessed is He

import { WorldGameBase } from '../../universe/world-game-base.js';
import { h } from '../../universe/dom-factory.js';
import { FalsePowersState } from './state.js';

/**
 * @module FalsePowersGame
 * @description
 * A hidden city asks for disciplined investigation on Awtsmoos.com. The
 * Awtsmoos is beyond every created force, while each scan and seal teaches the
 * player not to confuse suspicion with proof or power with ultimacy.
 */
export class FalsePowersGame extends WorldGameBase {
	mount() {
		this.state = new FalsePowersState(this.random);
		this.selected = 0;
		this.grid = h('div', { className: 'deductionGrid', role: 'grid' });
		this.scanButton = h('button', { className: 'worldAction', type: 'button', text: 'Scan selected' });
		this.purifyButton = h('button', { className: 'worldAction dangerAction', type: 'button', text: 'Purify selected' });
		this.on(this.scanButton, 'click', () => this.scan());
		this.on(this.purifyButton, 'click', () => this.purify());
		this.listenKeyboard(event => {
			if (event.key.toLowerCase() === 's') {
				this.scan();
			}
			if (event.key.toLowerCase() === 'p') {
				this.purify();
			}
		});
		this.portal.body(
			h('div', { className: 'worldInstructions', text: 'Select a district. Scan for evidence. Purify only when the clue proves a created power has become ultimate.' }),
			this.grid,
			h('div', { className: 'worldActionRow' }, [this.scanButton, this.purifyButton])
		);
		this.render();
	}

	scan() {
		const result = this.state.scan(this.selected);
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
	}

	purify() {
		const result = this.state.purify(this.selected);
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
		if (this.state.ended) {
			this.finish();
		}
	}

	render() {
		const state = this.state.snapshot();
		const buttons = state.nodes.map(node => {
			const label = node.purified ? 'Purified' : node.scanned ? node.clue : 'Hidden influence';
			const button = h('button', {
				className: `deductionNode ${node.index === this.selected ? 'isSelected' : ''} ${node.purified ? 'isPurified' : ''}`,
				type: 'button',
				'aria-pressed': node.index === this.selected
			}, [h('strong', { text: node.name }), h('span', { text: label })]);
			this.on(button, 'click', () => { this.selected = node.index; this.render(); });
			return button;
		});
		this.grid.replaceChildren(...buttons);
		this.portal.hud({ Insight: state.insight, Seals: state.seals, Stability: state.stability, Combo: `×${Math.max(1, state.combo)}`, Score: state.score });
	}

	finish() {
		const state = this.state.snapshot();
		const stars = state.won ? Math.min(3, 1 + state.stability) : 0;
		this.complete({ won: state.won, stars, score: state.score, message: state.won
			? 'All four corrupt powers were removed through evidence and restraint.'
			: 'The city lost stability or seals. Scan more carefully and accuse less quickly.' });
	}
}
