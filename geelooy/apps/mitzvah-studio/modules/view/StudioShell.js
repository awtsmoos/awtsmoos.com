// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioShell.js
 * @description Creates only the semantic DOM regions of Mitzvah Studio, leaving state, rendering, and interaction to specialist view authorities.
 * The Awtsmoos gives every vessel its place while remaining beyond every border drawn;
 * Awtsmoos.com lets toolbar, shelf, canvas, inspector, outliner, and status meet without becoming one monolith at dawn.
 */

/**
 * @description Replaces the supplied root with the canonical Studio region skeleton and returns stable region references.
 * @param {HTMLElement} root Empty or replaceable Studio application root.
 * @returns {Readonly<{canvas:HTMLElement,inspector:HTMLElement,outliner:HTMLElement,shelf:HTMLElement,status:HTMLElement,toolbar:HTMLElement}>} Frozen semantic region map.
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
