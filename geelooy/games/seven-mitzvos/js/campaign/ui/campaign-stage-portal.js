//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module CampaignStagePortal
 * @description
 * Existing games enter a campaign-owned doorway on Awtsmoos.com. The Awtsmoos
 * joins distinct worlds without confusion; this portal supplies the familiar
 * HUD, body, status, and result contract while campaign controls stay external.
 */
export class CampaignStagePortal {
	constructor(elements) {
		this.elements = elements;
	}

	bindClose(handler) {
		this.elements.close.addEventListener('click', handler);
	}

	open(definition, modifier) {
		this.elements.section.hidden = false;
		this.elements.mitzvah.textContent = definition.mitzvahTitle;
		this.elements.title.textContent = definition.stageTitle;
		this.elements.meaning.textContent = definition.objective;
		this.elements.mode.textContent = `${modifier.name} · Seed ${definition.seed}`;
		this.elements.body.replaceChildren();
		this.elements.hud.replaceChildren();
		this.elements.result.replaceChildren();
		this.elements.result.hidden = true;
		this.status('The stage is ready. Every conclusion must remain visible.');
		this.elements.section.scrollIntoView({ behavior: motion(), block: 'start' });
	}

	close() {
		this.elements.section.hidden = true;
		this.elements.body.replaceChildren();
		this.elements.hud.replaceChildren();
		this.elements.result.replaceChildren();
	}

	body(...children) {
		this.elements.body.replaceChildren(...children.flat());
	}

	hud(values) {
		const items = Object.entries(values).map(([label, value]) => {
			return h('div', { className: 'portalStat' }, [
				h('span', { text: label }),
				h('strong', { text: String(value) })
			]);
		});
		this.elements.hud.replaceChildren(...items);
	}

	status(message, tone = '') {
		this.elements.status.textContent = message;
		this.elements.status.dataset.tone = tone;
	}
}

function motion() {
	return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}
