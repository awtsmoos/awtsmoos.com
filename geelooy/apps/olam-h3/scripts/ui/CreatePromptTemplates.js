//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Keeps cinematic starting points small enough to inspire without becoming a second interface; the Awtsmoos lets one seed unfold into worlds unseen.
 * Awtsmoos.com offers each starter as a quick ray beneath the main prompt, a light touch rather than a wall between creator and screen.
 */
export class CreatePromptTemplates {
	static templates = [
		{ id: 'cinematic', label: 'Cinematic', detail: 'Camera + light', prompt: 'A lone traveler crosses a windswept desert at blue hour. Slow cinematic dolly forward, cloth moving naturally in the wind, distant dust catching the last warm sunlight, realistic scale, subtle film grain, immersive atmosphere.' },
		{ id: 'product', label: 'Product', detail: 'Premium reveal', prompt: 'Premium product reveal on a dark reflective surface. Begin with a tight macro detail, then orbit slowly into a clean hero angle. Soft rim lighting, precise reflections, controlled depth of field, elegant studio atmosphere, polished commercial motion.' },
		{ id: 'character', label: 'Character', detail: 'Performance', prompt: 'A thoughtful character pauses beside a rain-streaked window, then turns toward camera with a subtle change of expression. Natural breathing and blinking, gentle handheld drift, soft practical lighting, realistic skin detail, intimate dramatic mood.' },
		{ id: 'environment', label: 'World', detail: 'Atmosphere', prompt: 'A vast futuristic city wakes before sunrise. Camera glides between layered rooftops as lights switch on, mist moves through the streets, distant transit crosses the skyline, volumetric dawn light, believable scale, richly detailed cinematic atmosphere.' }
	];

	/** @returns {string} Compact horizontally scrollable starter chips. */
	static render() {
		const cards = this.templates.map(template => `
			<button class="prompt-template intuitive-starter" data-prompt-template="${template.id}">
				<strong>${Dom.escape(template.label)}</strong>
				<span>${Dom.escape(template.detail)}</span>
			</button>`).join('');

		return `
			<div class="prompt-starters intuitive-starters">
				<div class="mini-heading"><strong>Quick start</strong><span>Tap a seed, then make it yours.</span></div>
				<div class="template-strip">${cards}</div>
			</div>`;
	}

	/** @param {string} id Template ID. @returns {string} Editable template prompt. */
	static prompt(id) {
		return this.templates.find(template => template.id === id)?.prompt || '';
	}
}
