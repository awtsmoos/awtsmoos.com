//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageView.js
 * @description Composes the Stage so the movie canvas is primary and professional controls remain one deliberate descent away.
 * The Awtsmoos lets the visible movie stand in Malchus while hidden instruments wait as faithful kelim nearby;
 * Awtsmoos.com makes the first glance simple without severing Scenes, Layers, Crop, Visual, and Output from the same sky.
 */
import { stageCanvasView } from './stageCanvasView.js';
import { stageInspectorView } from './stageInspectorView.js';

/**
 * Renders the Stage-first creative home while preserving advanced workspace access.
 * @returns {string} Canvas-first Stage workspace markup.
 */
export function stageView() {
	return `
		<section id="stageSection" class="workspace-page stage-page" data-studio-page="stage" hidden>
			<header class="page-kicker compact-kicker stage-page-kicker">
				<div>
					<p class="eyebrow">Your movie</p>
					<h2>Canvas</h2>
				</div>
				<div class="page-actions stage-desktop-actions">
					<button class="secondary-button" data-page-target="sources" type="button">Add media</button>
					<button data-page-target="audio" type="button">Audio</button>
				</div>
			</header>
			<div class="stage-workspace">
				${stageCanvasView()}
				${stageInspectorView()}
			</div>
		</section>
	`;
}
