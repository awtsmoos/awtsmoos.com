//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioScenePanel.js
 * @description Keeps canonical scene navigation as a filmstrip while selected-scene naming, duration, ordering, duplication, creation, and deletion remain real edits beneath it.
 * The Awtsmoos lets many scenes become one river while Awtsmoos.com gives the chosen moment exact temporal controls without replacing filmstrip clarity with a mobile form wall.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioPanelFrame } from './StudioPanelFrame.js';
import { createStudioSceneCard } from './StudioSceneCard.js';
export function createStudioScenePanel() {
	return createStudioPanelFrame('Scenes', UI.div(
		{ class: 'studio-scene-editor' },
		UI.div({ class: 'aw-ui-scroll studio-scenes', 'aria-label': 'Movie scene filmstrip' }, createStudioSceneCard()),
		UI.div({ class: 'studio-scene-controls' },
			UI.input({ class: 'studio-scene-name-input', type: 'text', value: context => selectedScene(context)?.name || '',
				'aria-label': 'Selected scene name', $on: { change: 'renameStudioScene' } }),
			UI.input({ class: 'studio-scene-duration-input', type: 'number', min: '0.1', step: '0.1',
				value: context => String(selectedScene(context)?.duration || 1), 'aria-label': 'Selected scene duration in seconds',
				$on: { change: 'changeStudioSceneDuration' } }),
			...sceneControlButtons()
		)
	), 'studio-scene-panel');
}
function sceneControlButtons() {
	return [
		control('←', 'Move scene earlier', 'moveStudioSceneLeft'), control('→', 'Move scene later', 'moveStudioSceneRight'),
		control('＋', 'Add scene after selected scene', 'addStudioScene'), control('⧉', 'Duplicate selected scene', 'duplicateStudioScene'),
		control('⌫', 'Delete selected scene', 'deleteStudioScene')
	];
}
function control(text, label, action) {
	return UI.button({ class: 'studio-scene-control-button', type: 'button', text, 'aria-label': label, $on: { click: action } });
}
function selectedScene(context) {
	const id = context.store.get('selectedSceneId');
	return context.store.get('movie.scenes', []).find(scene => scene.id === id) || null;
}
