//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../universe/dom-factory.js';

/**
 * @module UniverseHub
 * @description
 * Seven exact laws remain visible as seven playable cards on Awtsmoos.com. The
 * Awtsmoos allows no game title or icon to obscure the commandment, its plain
 * meaning, its controls, or the player's honest local progress.
 */
export class UniverseHub {
	constructor(elements, definitions, progress) {
		this.elements = elements;
		this.definitions = definitions;
		this.progress = progress;
		this.mode = 'solo';
		this.launch = () => {};
	}

	mount(launch) {
		this.launch = launch;
		this.renderModes();
		this.render();
	}

	renderModes() {
		const modes = [
			['solo', 'Solo'],
			['daily', 'Daily challenge'],
			['council', '2-player Council']
		];
		const controls = modes.map(([value, label], index) => {
			const input = h('input', { type: 'radio', name: 'universe-mode', value, checked: index === 0 });
			input.addEventListener('change', () => {
				this.mode = value;
			});
			return h('label', { className: 'modeChoice' }, [input, h('span', { text: label })]);
		});
		this.elements.modes.replaceChildren(...controls);
	}

	render() {
		this.elements.grid.replaceChildren(...this.definitions.map(definition => this.card(definition)));
		const legacy = this.progress.legacy();
		this.elements.level.textContent = `Level ${legacy.level}`;
		this.elements.fill.style.width = `${legacy.mastery / 7}%`;
	}

	card(definition) {
		const record = this.progress.game(definition.id);
		const play = h('button', { className: 'universePlay', type: 'button', text: `Play ${definition.gameTitle}` });
		play.addEventListener('click', () => this.launch(definition.id, this.mode));
		return h('article', {
			className: 'universeCard',
			style: { '--world-hue': String(definition.hue) }
		}, [
			h('div', { className: 'universeCardTop' }, [
				h('span', { className: 'universeNumber', text: definition.number }),
				h('span', { className: 'universeSymbol', text: definition.symbol }),
				h('span', { className: 'universeGenre', text: definition.genre })
			]),
			h('h3', { text: definition.title }),
			h('p', { className: 'universeMeaning', text: definition.summary }),
			h('div', { className: 'universeGameName' }, [h('strong', { text: definition.gameTitle }), h('span', { text: definition.hook })]),
			h('p', { className: 'universeControls', text: definition.controls }),
			h('div', { className: 'universeProgress' }, [
				h('span', { text: `Best ${record.best.toLocaleString()}` }),
				h('span', { text: `Mastery ${record.mastery}%` }),
				h('span', { text: '★'.repeat(record.stars) + '☆'.repeat(3 - record.stars) })
			]),
			play
		]);
	}
}
