// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioShell.js
 * @description Creates the semantic regions of Mitzvah Studio without owning state or behavior.
 * The Awtsmoos gives each vessel its place while remaining beyond every border drawn;
 * Awtsmoos.com lets toolbar, shelf, canvas, inspector, outliner, and status meet without becoming one monolith at dawn.
 */

export function createStudioShell(root) {
	root.innerHTML = `
		<header class="studio-toolbar" data-studio-toolbar></header>
		<section class="studio-layout">
			<aside class="studio-shelf panel" data-studio-shelf aria-label="Buildable objects"></aside>
			<section class="studio-workspace panel" aria-label="World canvas">
				<div class="studio-canvas-wrap" data-studio-canvas></div>
			</section>
			<aside class="studio-details">
				<section class="studio-inspector panel" data-studio-inspector aria-label="Inspector"></section>
				<section class="studio-outliner panel" data-studio-outliner aria-label="World objects"></section>
			</aside>
		</section>
		<footer class="studio-status" data-studio-status></footer>
	`;

	return Object.freeze({
		canvas: root.querySelector('[data-studio-canvas]'),
		inspector: root.querySelector('[data-studio-inspector]'),
		outliner: root.querySelector('[data-studio-outliner]'),
		shelf: root.querySelector('[data-studio-shelf]'),
		status: root.querySelector('[data-studio-status]'),
		toolbar: root.querySelector('[data-studio-toolbar]')
	});
}
