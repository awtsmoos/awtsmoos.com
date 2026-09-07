//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioScenePanel.js
 * @description Renders compact scene navigation plus real selected-scene creation, ordering, naming, duration, duplication, and deletion controls.
 * The Awtsmoos lets every scene keep its dimensional song while Awtsmoos.com gives the maker a small rail for changing the movie's actual order and time;
 * name, duration, copy, move, add, and remove remain close to the selected scene so mobile creation stays direct instead of becoming a distant administrative climb.
 */

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioPanelFrame } from './StudioPanelFrame.js';

export function createStudioScenePanel() {
	return createStudioPanelFrame(
		'Scenes',
		UI.div(
			{ class: 'studio-scene-editor' },
			UI.div({ class: 'aw-ui-stack aw-ui-scroll studio-scenes' }, createSceneButton()),
			UI.div(
				{ class: 'studio-scene-controls' },
				UI.input({
					class: 'studio-scene-name-input',
					type: 'text',
					value: context => selectedScene(context)?.name || '',
					'aria-label': 'Selected scene name',
					$on: { change: 'renameStudioScene' }
				}),
				UI.input({
					class: 'studio-scene-duration-input',
					type: 'number',
					min: '0.1',
					step: '0.1',
					value: context => String(selectedScene(context)?.duration || 1),
					'aria-label': 'Selected scene duration in seconds',
					$on: { change: 'changeStudioSceneDuration' }
				}),
				...sceneControlButtons()
			)
		),
		'studio-scene-panel'
	);
}

function createSceneButton() {
	return UI.button({
		class: 'studio-scene',
		type: 'button',
		$each: { items: context => context.store.get('movie.scenes', []) },
		text: context => sceneLabel(context.data.item),
		'aria-label': context => sceneAriaLabel(context.data.item),
		'data-scene-id': context => context.data.item.id,
		'aria-pressed': context => String(context.store.get('selectedSceneId') === context.data.item.id),
		$on: { click: 'selectScene' }
	});
}

function sceneControlButtons() {
	return [
		control('←', 'Move scene earlier', 'moveStudioSceneLeft'),
		control('→', 'Move scene later', 'moveStudioSceneRight'),
		control('＋', 'Add scene after selected scene', 'addStudioScene'),
		control('⧉', 'Duplicate selected scene', 'duplicateStudioScene'),
		control('⌫', 'Delete selected scene', 'deleteStudioScene')
	];
}

function control(text, label, action) {
	return UI.button({
		class: 'studio-scene-control-button',
		type: 'button',
		text,
		'aria-label': label,
		$on: { click: action }
	});
}

function selectedScene(context) {
	const id = context.store.get('selectedSceneId');
	return context.store.get('movie.scenes', []).find(scene => scene.id === id) || null;
}

function sceneLabel(scene) {
	return `${scene.name} · ${formatTime(scene.start)}`;
}

function sceneAriaLabel(scene) {
	return `${scene.name}, ${inferMode(scene)}, starts at ${formatTime(scene.start)}, ${scene.duration}s`;
}

function formatTime(seconds) {
	const value = Math.max(0, Math.round(Number(seconds) || 0));
	return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

function inferMode(scene) {
	const kinds = (scene.layers || []).map(layer => String(layer.kind || ''));
	const has3d = kinds.some(kind => kind.endsWith('3d'));
	const has2d = kinds.some(kind => !kind.endsWith('3d') && kind !== 'audio');
	return has3d && has2d ? 'hybrid' : has3d ? '3d' : '2d';
}
