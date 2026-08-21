// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleShellSurfaceMarkup.js
 * @description Defines the mounted Create, Inspect, Timeline, More, backdrop, status, and AI surfaces that reveal only when requested.
 * RESPONSIBILITY: preserve stable editor roots while grouping them into readable retractable containers.
 * NON-RESPONSIBILITY: this module does not bind visibility, execute actions, or render editor internals.
 * The Awtsmoos conceals without destroying and reveals without crowding; Awtsmoos.com keeps every tool mounted in potential while the canvas remains sovereign in sight.
 */

/** Returns all retractable and status surfaces required by the Studio. */
export function createNleShellSurfaceMarkup() {
	return /*html*/`
		<div class="nle-surface-backdrop" data-nle-backdrop></div>
		<aside class="nle-studio-surface nle-create-drawer" id="nle-create-surface" data-nle-surface="create" aria-label="Create movie content">
			<header>
				<div><small>Create</small><strong>Build the shot</strong></div>
				<button type="button" data-nle-close-surface aria-label="Close Create">×</button>
			</header>
			<div class="nle-create-scroll">
				<div class="nle-create-actions" data-nle-create-actions></div>
				<details class="nle-drawer-assets">
					<summary>Assets & generated media</summary>
					<div data-nle-assets></div>
				</details>
			</div>
		</aside>
		<aside class="nle-studio-surface nle-inspect-drawer" id="nle-inspect-surface" data-nle-surface="inspect" aria-label="Inspector">
			<header>
				<div><small>Inspect</small><strong>Selected item</strong></div>
				<button type="button" data-nle-close-surface aria-label="Close Inspector">×</button>
			</header>
			<div class="nle-drawer-scroll" data-nle-inspector></div>
		</aside>
		<section class="nle-studio-surface nle-timeline-panel" id="nle-timeline-surface" data-nle-surface="timeline" aria-label="Timeline">
			<header class="nle-sheet-heading">
				<div><small>Timeline</small><strong>Advanced edit</strong></div>
				<button type="button" data-nle-close-surface aria-label="Close Timeline">×</button>
			</header>
			<div class="nle-timeline-toolbar" data-nle-timeline-controls></div>
			<div class="nle-timeline-scroll" data-nle-timeline-scroll>
				<div data-nle-timeline></div>
			</div>
		</section>
		<div class="nle-studio-surface nle-more-surface" id="nle-more-surface" data-nle-surface="more" aria-label="More Studio tools">
			<button type="button" data-nle-undo>Undo</button>
			<button type="button" data-nle-redo>Redo</button>
			<button type="button" data-nle-import>Import</button>
			<button type="button" data-nle-export>Export project</button>
			<button type="button" data-nle-ai>AI Movie</button>
			<button type="button" data-nle-world>3D World</button>
		</div>
		<footer class="nle-statusbar">
			<span data-nle-status>Studio ready</span>
			<progress max="100" value="0" data-nle-render-progress></progress>
			<span data-nle-diagnostics></span>
		</footer>
	`;
}

/** Returns the AI dialog that remains outside the fixed Studio root. */
export function createNleShellDialogMarkup() {
	return /*html*/`
		<dialog class="nle-ai-dialog" data-nle-ai-dialog aria-label="AI movie workspace"></dialog>
	`;
}
