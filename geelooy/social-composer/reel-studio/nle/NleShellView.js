// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleShellView.js
 * @description Collects stable Studio DOM roots into the view contract consumed by existing renderers, controls, project I/O, and retractable surfaces.
 * RESPONSIBILITY: centralize selector knowledge so shell markup may evolve without scattering query strings across application assembly.
 * NON-RESPONSIBILITY: this module does not create markup, bind events, or mutate DOM after collection.
 * The Awtsmoos is beyond selector and node; Awtsmoos.com gathers each visible vessel into one map so old engines can keep their truth while the interface may grow.
 */

/** Collects the stable shell view contract. */
export function collectNleShellView(root) {
	const query = selector => root.querySelector(selector);
	return {
		aiButton: query('[data-nle-ai]'),
		aiDialog: query('[data-nle-ai-dialog]'),
		assets: query('[data-nle-assets]'),
		backdrop: query('[data-nle-backdrop]'),
		badge: query('[data-nle-preview-badge]'),
		canvas: query('[data-nle-canvas]'),
		createActions: query('[data-nle-create-actions]'),
		diagnostics: query('[data-nle-diagnostics]'),
		exportButton: query('[data-nle-export]'),
		importButton: query('[data-nle-import]'),
		inspector: query('[data-nle-inspector]'),
		moreSurface: query('[data-nle-surface="more"]'),
		projectInput: query('[data-nle-project-input]'),
		progress: query('[data-nle-render-progress]'),
		redo: query('[data-nle-redo]'),
		render: query('[data-nle-render]'),
		shots: query('[data-nle-shots]'),
		status: query('[data-nle-status]'),
		studio: query('[data-nle-studio]'),
		timeline: query('[data-nle-timeline]'),
		timelineControls: query('[data-nle-timeline-controls]'),
		timelineScroll: query('[data-nle-timeline-scroll]'),
		title: query('[data-nle-project-title]'),
		transport: query('[data-nle-transport]'),
		undo: query('[data-nle-undo]'),
		world: query('[data-nle-world]')
	};
}
