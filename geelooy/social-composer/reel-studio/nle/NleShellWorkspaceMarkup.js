// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleShellWorkspaceMarkup.js
 * @description Keeps preview and transport permanently visible while Timeline becomes an explicit reveal rather than a permanent viewport tax.
 * RESPONSIBILITY: return the central canvas workspace and timeline affordance markup.
 * NON-RESPONSIBILITY: this module does not render frames, build tracks, or control panel state.
 * The Awtsmoos gives the image room to breathe; Awtsmoos.com places advanced time one deliberate click away instead of beneath every frame by decree.
 */

/** Returns the persistent preview workspace markup. */
export function createNleShellWorkspaceMarkup() {
	return /*html*/`
		<section class="nle-workspace">
			<section class="nle-preview-panel">
				<div class="nle-canvas-stage">
					<canvas data-nle-canvas aria-label="Movie preview"></canvas>
					<div class="nle-preview-badge" data-nle-preview-badge></div>
				</div>
				<div class="nle-transport" data-nle-transport></div>
			</section>
			<button type="button" class="nle-timeline-reveal" data-nle-panel-toggle="timeline" aria-controls="nle-timeline-surface">Timeline</button>
		</section>
	`;
}
