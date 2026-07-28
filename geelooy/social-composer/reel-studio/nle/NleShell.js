// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleShell
 * @description
 * Library, canvas, inspector, timeline, and AI movie exchange gather into one
 * studio while phones change upper panes without ever losing the timeline.
 */

export function createNleShell(root = document) {
	root.body.innerHTML = /*html*/`
		<main class="nle-studio" data-nle-studio>
			<header class="nle-topbar">
				<div class="nle-brand"><span aria-hidden="true">✦</span><div><small>MitzvahWorld</small><strong>Movie Studio</strong></div></div>
				<label class="nle-title-field"><span>Project</span><input data-nle-project-title></label>
				<div class="nle-top-actions">
					<button type="button" data-nle-undo title="Undo">↶</button><button type="button" data-nle-redo title="Redo">↷</button>
					<button type="button" data-nle-import>Import</button><button type="button" data-nle-export>Project</button>
					<button type="button" class="nle-ai-action" data-nle-ai>AI Movie</button><button type="button" data-nle-world>3D World</button>
					<button type="button" class="nle-render-action" data-nle-render>Render movie</button>
				</div>
				<input type="file" accept="application/json,.json" data-nle-project-input hidden>
			</header>
			<nav class="nle-mobile-tabs" aria-label="Editor panels"><button type="button" data-nle-tab="assets">Assets</button><button type="button" data-nle-tab="preview" aria-current="page">Canvas</button><button type="button" data-nle-tab="inspector">Inspector</button></nav>
			<section class="nle-workspace">
				<aside class="nle-panel nle-assets-panel" data-nle-panel="assets"><div data-nle-assets></div></aside>
				<section class="nle-preview-panel" data-nle-panel="preview"><div class="nle-canvas-stage"><canvas data-nle-canvas aria-label="Movie preview"></canvas><div class="nle-preview-badge" data-nle-preview-badge></div></div><div class="nle-transport" data-nle-transport></div></section>
				<aside class="nle-panel nle-inspector-panel" data-nle-panel="inspector"><div data-nle-inspector></div></aside>
			</section>
			<section class="nle-timeline-panel"><div class="nle-timeline-toolbar" data-nle-timeline-controls></div><div class="nle-timeline-scroll" data-nle-timeline-scroll><div data-nle-timeline></div></div></section>
			<footer class="nle-statusbar"><span data-nle-status>Studio ready</span><progress max="100" value="0" data-nle-render-progress></progress><span data-nle-diagnostics></span></footer>
		</main>
		<dialog class="nle-ai-dialog" data-nle-ai-dialog aria-label="AI movie workspace"></dialog>
	`;
	return collect(root);
}

function collect(root) {
	const query = selector => root.querySelector(selector);
	return {
		aiButton: query('[data-nle-ai]'), aiDialog: query('[data-nle-ai-dialog]'), assets: query('[data-nle-assets]'),
		badge: query('[data-nle-preview-badge]'), canvas: query('[data-nle-canvas]'), diagnostics: query('[data-nle-diagnostics]'),
		exportButton: query('[data-nle-export]'), importButton: query('[data-nle-import]'), inspector: query('[data-nle-inspector]'),
		projectInput: query('[data-nle-project-input]'), progress: query('[data-nle-render-progress]'), redo: query('[data-nle-redo]'),
		render: query('[data-nle-render]'), status: query('[data-nle-status]'), studio: query('[data-nle-studio]'),
		timeline: query('[data-nle-timeline]'), timelineControls: query('[data-nle-timeline-controls]'), timelineScroll: query('[data-nle-timeline-scroll]'),
		title: query('[data-nle-project-title]'), transport: query('[data-nle-transport]'), undo: query('[data-nle-undo]'), world: query('[data-nle-world]')
	};
}
