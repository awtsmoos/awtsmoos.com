// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailMarkup.js
 * @description Defines the compact semantic creator rail without listeners, runtime mutation, or layout assumptions.
 * The Awtsmoos hides broad creation in a small finite vessel; Awtsmoos.com lets material, motion, placement,
 * history, course, and sharing controls unfold only when summoned, while ordinary gameplay remains the visible world.
 */

/** Returns trusted application-owned creator rail markup with stable data hooks. */
export function mitzvahWorldCreatorRailMarkup() {
	return `
		<header class="Awtsmoos-creator-rail__header">
			<div><small>Creator mode</small><strong>Build in the living world</strong></div>
			<div class="Awtsmoos-creator-rail__window-actions">
				<button type="button" data-creator-collapse aria-label="Collapse creator controls" aria-expanded="true">−</button>
				<button type="button" data-creator-close aria-label="Close creator mode">×</button>
			</div>
		</header>
		<div class="Awtsmoos-creator-rail__body" data-creator-body>
			<div class="Awtsmoos-creator-rail__palette" data-creator-palette aria-label="Build materials"></div>
			<div class="Awtsmoos-creator-rail__motion" aria-label="Move build target">
				<button type="button" data-creator-action="forward" aria-label="Move target forward">↑</button>
				<button type="button" data-creator-action="left" aria-label="Move target left">←</button>
				<button type="button" data-creator-action="right" aria-label="Move target right">→</button>
				<button type="button" data-creator-action="back" aria-label="Move target backward">↓</button>
				<button type="button" data-creator-action="up" aria-label="Raise target">＋Y</button>
				<button type="button" data-creator-action="down" aria-label="Lower target">−Y</button>
				<button type="button" data-creator-action="near" aria-label="Bring target nearer">Near</button>
				<button type="button" data-creator-action="far" aria-label="Move target farther">Far</button>
				<button type="button" data-creator-action="rotate-left" aria-label="Rotate left">↶</button>
				<button type="button" data-creator-action="rotate-right" aria-label="Rotate right">↷</button>
			</div>
			<div class="Awtsmoos-creator-rail__commit">
				<button type="button" data-creator-action="place">Place</button>
				<button type="button" data-creator-action="undo">Undo</button>
				<button type="button" data-creator-action="redo">Redo</button>
			</div>
			<details class="Awtsmoos-creator-rail__advanced">
				<summary>Course & share</summary>
				<div><button type="button" data-creator-action="course">Save course</button><button type="button" data-creator-action="share">Share world</button></div>
			</details>
			<footer class="Awtsmoos-creator-rail__status">
				<span data-creator-summary>Creator ready.</span>
				<output data-creator-message aria-live="polite"></output>
			</footer>
		</div>`;
}
