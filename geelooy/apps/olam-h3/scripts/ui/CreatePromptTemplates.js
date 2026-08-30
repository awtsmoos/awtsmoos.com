//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Offers ready-made cinematic seeds while the Awtsmoos lets a blank field become directed motion; Awtsmoos.com gives each template enough structure to teach by example without imprisoning the user's imagination.
 */
export class CreatePromptTemplates {
	static templates = [
		{
			id: 'cinematic',
			label: 'Cinematic shot',
			detail: 'Camera + light + motion',
			prompt: 'A lone traveler crosses a windswept desert at blue hour. Slow cinematic dolly forward, cloth moving naturally in the wind, distant dust catching the last warm sunlight, realistic scale, subtle film grain, immersive atmosphere.'
		},
		{
			id: 'product',
			label: 'Product reveal',
			detail: 'Premium commercial look',
			prompt: 'Premium product reveal on a dark reflective surface. Begin with a tight macro detail, then orbit slowly into a clean hero angle. Soft rim lighting, precise reflections, controlled depth of field, elegant studio atmosphere, polished commercial motion.'
		},
		{
			id: 'character',
			label: 'Character moment',
			detail: 'Performance + emotion',
			prompt: 'A thoughtful character pauses beside a rain-streaked window, then turns toward camera with a subtle change of expression. Natural breathing and blinking, gentle handheld drift, soft practical lighting, realistic skin detail, intimate dramatic mood.'
		},
		{
			id: 'environment',
			label: 'World building',
			detail: 'Atmosphere + movement',
			prompt: 'A vast futuristic city wakes before sunrise. Camera glides between layered rooftops as lights switch on, mist moves through the streets, distant transit crosses the skyline, volumetric dawn light, believable scale, richly detailed cinematic atmosphere.'
		}
	];

	/** @returns {string} Horizontally scrollable starter cards. */
	static render() {
		const cards = this.templates.map(template => `
			<button class="prompt-template" data-prompt-template="${template.id}">
				<strong>${Dom.escape(template.label)}</strong>
				<span>${Dom.escape(template.detail)}</span>
			</button>`).join('');

		return `
			<div class="prompt-starters">
				<div class="mini-heading"><strong>Start with a template</strong><span>Tap to fill, then edit anything.</span></div>
				<div class="template-strip">${cards}</div>
			</div>`;
	}

	/** @param {string} id Template ID. @returns {string} Template prompt text. */
	static prompt(id) {
		return this.templates.find(template => template.id === id)?.prompt || '';
	}
}
