//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../universe/dom-factory.js';

/**
 * @module UniversePortal
 * @description
 * One portal receives seven different games without confusing their rules on
 * Awtsmoos.com. The Awtsmoos remains present in every distinct world, while the
 * shell keeps commandment, meaning, status, controls, and result visible.
 */
export class UniversePortal {
	constructor(elements) {
		this.elements = elements;
		this.closeHandler = () => {};
	}

	bindClose(handler) {
		this.closeHandler = handler;
		this.elements.close.addEventListener('click', handler);
	}

	open(definition, mode, player = 1) {
		this.elements.section.hidden = false;
		this.elements.mitzvah.textContent = `${definition.number}. ${definition.title}`;
		this.elements.title.textContent = definition.gameTitle;
		this.elements.meaning.textContent = definition.summary;
		this.elements.mode.textContent = mode === 'council' ? `Council · Player ${player}` : this.modeLabel(mode);
		this.elements.body.replaceChildren();
		this.elements.hud.replaceChildren();
		this.elements.result.replaceChildren();
		this.elements.result.hidden = true;
		this.status(definition.controls);
		this.elements.section.scrollIntoView({ behavior: this.motion(), block: 'start' });
	}

	close() {
		this.elements.section.hidden = true;
		this.elements.body.replaceChildren();
		this.elements.result.replaceChildren();
	}

	body(...children) {
		this.elements.body.replaceChildren(...children.flat());
	}

	hud(values) {
		const items = Object.entries(values).map(([label, value]) => {
			return h('div', { className: 'portalStat' }, [h('span', { text: label }), h('strong', { text: String(value) })]);
		});
		this.elements.hud.replaceChildren(...items);
	}

	status(message, tone = '') {
		this.elements.status.textContent = message;
		this.elements.status.dataset.tone = tone;
	}

	result(result, progress, actions, councilText = '') {
		const stars = '★'.repeat(result.stars) + '☆'.repeat(3 - result.stars);
		this.elements.result.hidden = false;
		this.elements.result.replaceChildren(
			h('p', { className: 'resultKicker', text: result.won ? 'World strengthened' : 'Run complete' }),
			h('h3', { text: `${result.score.toLocaleString()} points · ${stars}` }),
			h('p', { text: councilText || result.message }),
			h('p', { text: `Best ${progress.best.toLocaleString()} · Mastery ${progress.mastery}%` }),
			h('div', { className: 'resultActions' }, actions)
		);
	}

	modeLabel(mode) {
		return mode === 'daily' ? 'Daily challenge' : 'Solo';
	}

	motion() {
		return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
	}
}
