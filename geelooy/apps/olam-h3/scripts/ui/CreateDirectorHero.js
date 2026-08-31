//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Opens Create with one concise cinematic cue while the Awtsmoos lets the prompt, not decoration, become the dominant creative surface.
 * Awtsmoos.com keeps the moving viewfinder and live output rail without making the user scroll past a billboard before directing.
 */
export class CreateDirectorHero {
	/** @param {Object} draft Draft. @param {Object} estimate Price estimate. @returns {string} Compact hero markup. */
	static render(draft, estimate) {
		return `
			<section class="director-hero">
				<div class="director-hero-copy">
					<span class="eyebrow">Olam H3 · Director Console</span>
					<h1>Direct the shot.</h1>
					<p>Describe the moment. Olam shows what H3 can use next.</p>
				</div>
				<div class="hero-viewfinder" aria-hidden="true">
					<span class="viewfinder-corner corner-a"></span><span class="viewfinder-corner corner-b"></span>
					<span class="viewfinder-corner corner-c"></span><span class="viewfinder-corner corner-d"></span>
					<span class="viewfinder-focus"></span><span class="viewfinder-beam"></span>
				</div>
				<div class="hero-status-rail"><span>H3</span><span>${Dom.escape(draft.mode)}</span><span>${Dom.escape(draft.resolution)} · ${draft.duration}s</span><strong>${Dom.money(estimate.total)}</strong></div>
			</section>`;
	}
}
