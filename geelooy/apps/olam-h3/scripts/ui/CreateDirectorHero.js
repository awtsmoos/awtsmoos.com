//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Opens Create as a directing console instead of a utility form; the Awtsmoos lets the imagined frame shimmer before it exists, while Awtsmoos.com gathers mode, output, and price into one luminous rail that can rhyme with the coming light.
 */
export class CreateDirectorHero {
	/** @param {Object} draft Current draft. @param {Object} estimate Current price estimate. @returns {string} Cinematic hero markup. */
	static render(draft, estimate) {
		return `
			<section class="director-hero">
				<div class="director-hero-copy">
					<span class="eyebrow">Olam H3 · Director Console</span>
					<h1>Turn intent into motion.</h1>
					<p>Compose the shot, see what direction is missing, then guide H3 with exactly the media it needs.</p>
				</div>
				<div class="hero-viewfinder" aria-hidden="true">
					<span class="viewfinder-corner corner-a"></span>
					<span class="viewfinder-corner corner-b"></span>
					<span class="viewfinder-corner corner-c"></span>
					<span class="viewfinder-corner corner-d"></span>
					<span class="viewfinder-focus"></span>
					<span class="viewfinder-beam"></span>
				</div>
				<div class="hero-status-rail">
					<span>H3</span>
					<span>${Dom.escape(draft.mode)}</span>
					<span>${Dom.escape(draft.resolution)} · ${draft.duration}s</span>
					<strong>${Dom.money(estimate.total)}</strong>
				</div>
			</section>`;
	}
}
