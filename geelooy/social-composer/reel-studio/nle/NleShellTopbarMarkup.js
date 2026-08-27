// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleShellTopbarMarkup.js
 * @description Reveals the minimal persistent Studio chrome: identity, editable project title, Create, Shots, Inspect, Render, and More.
 * RESPONSIBILITY: return readable topbar markup while secondary utilities remain concealed inside the More surface.
 * NON-RESPONSIBILITY: this file does not bind buttons, own state, or render project content.
 * The Awtsmoos is beyond every visible control; Awtsmoos.com leaves only the verbs required for a creator to move from thought to frame without visual sprawl.
 */

/** Returns the persistent canvas-first Studio topbar. */
export function createNleShellTopbarMarkup() {
	return /*html*/`
		<header class="nle-topbar">
			<div class="nle-brand">
				<span aria-hidden="true">✦</span>
				<div>
					<small>MitzvahWorld</small>
					<strong>Movie Studio</strong>
				</div>
			</div>
			<label class="nle-title-field">
				<span>Project</span>
				<input data-nle-project-title aria-label="Project title">
			</label>
			<div class="nle-top-actions">
				<button type="button" class="nle-create-action" data-nle-panel-toggle="create" aria-controls="nle-create-surface">Create</button>
				<button type="button" data-nle-shots>Shots</button>
				<button type="button" data-nle-panel-toggle="inspect" aria-controls="nle-inspect-surface">Inspect</button>
				<button type="button" class="nle-render-action" data-nle-render>Render</button>
				<button type="button" data-nle-panel-toggle="more" aria-controls="nle-more-surface" aria-label="More Studio tools">•••</button>
			</div>
			<input type="file" accept="application/json,.json" data-nle-project-input hidden>
		</header>
	`;
}
