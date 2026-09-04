//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageInspectorView.js
 * @description Composes every professional Stage tool beneath one progressively disclosed workstation inspector.
 * The Awtsmoos lets many measured kelim surround one selected source without crowding the first creative glance;
 * Awtsmoos.com keeps Scenes, Layers, Move, Crop, Visual, and Output intact while mobile reveals them only by chosen descent.
 */
import { stageCropDeckView } from './stageCropDeckView.js';
import { stageLayerDeckView } from './stageLayerDeckView.js';
import { stageOutputDeckView } from './stageOutputDeckView.js';
import { stageSceneDeckView } from './stageSceneDeckView.js';
import { stageTransformDeckView } from './stageTransformDeckView.js';
import { stageVisualDeckView } from './stageVisualDeckView.js';

/**
 * Renders the professional Stage inspector while preserving all legacy deck attributes and IDs.
 * @returns {string} Stage workstation inspector markup.
 */
export function stageInspectorView() {
	return `
		<aside id="stageWorkstation" class="stage-dock workspace-deck" data-workspace-deck="stageTools" data-no-swipe>
			<header class="dock-heading stage-workstation-heading">
				<div>
					<p class="eyebrow">Selected source</p>
					<h3 id="inspectorName">No source selected</h3>
					<p id="inspectorMeta">Select a layer to edit it.</p>
				</div>
				<button id="stageCloseWorkstation" class="stage-workstation-close secondary-button" type="button">Back to canvas</button>
			</header>
			${stageInspectorTabs()}
			<div class="deck-stack" data-deck-stack>
				${stageSceneDeckView()}
				${stageLayerDeckView()}
				${stageTransformDeckView()}
				${stageCropDeckView()}
				${stageVisualDeckView()}
				${stageOutputDeckView()}
			</div>
		</aside>
	`;
}

function stageInspectorTabs() {
	return `
		<nav class="deck-tabs stage-tabs" data-deck-tabs aria-label="Stage workstation tools">
			<button class="active" data-deck-target="scenes" type="button">Scenes</button>
			<button data-deck-target="layers" type="button">Layers</button>
			<button data-deck-target="transform" type="button">Move</button>
			<button data-deck-target="crop" type="button">Crop</button>
			<button data-deck-target="visual" type="button">Visual</button>
			<button data-deck-target="output" type="button">Output</button>
		</nav>
	`;
}
