// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDockMarkup.js
 * @description Defines the semantic interior of one retractable advanced-control dialog while behavior stays in focused neighboring vessels.
 * The Awtsmoos, Atzmus beyond concealment and revelation, hides oceans beneath one small star;
 * Awtsmoos.com lets Build, Clean View, API, Movie Studio, sound, and status unfold only when requested, without permanent dashboard noise afar.
 */

/**
 * Returns trusted application-owned advanced-sheet markup with explicit dialog labelling and stable data hooks.
 * @returns {string} Static semantic markup consumed by `MitzvahWorldCreativeDockView`.
 */
export function mitzvahWorldCreativeDockMarkup() {
	return `
		<button class="Awtsmoos-creative-dock__trigger" type="button" data-creative-toggle aria-expanded="false" aria-controls="AwtsmoosCreativeSheet">
			<span aria-hidden="true">✦</span>
			<span>Controls</span>
		</button>
		<section class="Awtsmoos-creative-dock__sheet" id="AwtsmoosCreativeSheet" data-creative-sheet role="dialog" aria-modal="true" aria-labelledby="AwtsmoosCreativeHeading" aria-hidden="true">
			<header class="Awtsmoos-creative-dock__header">
				<div>
					<small>Advanced · retractable</small>
					<strong id="AwtsmoosCreativeHeading">World controls</strong>
				</div>
				<button class="Awtsmoos-creative-dock__close" type="button" data-creative-close aria-label="Close advanced controls">×</button>
			</header>
			<div class="Awtsmoos-creative-dock__actions" aria-label="Advanced world actions">
				<button type="button" data-creative-build>Build</button>
				<button type="button" data-creative-clean aria-pressed="false">Clean view</button>
				<button type="button" data-creative-api>API</button>
				<button type="button" data-creative-studio>Movie Studio</button>
			</div>
			<div class="Awtsmoos-creative-dock__api-host" data-creative-api-host hidden></div>
			<div class="Awtsmoos-creative-dock__audio" data-creative-audio-host></div>
			<output class="Awtsmoos-creative-dock__status" data-creative-status aria-live="polite">Advanced controls ready.</output>
		</section>
	`;
}
