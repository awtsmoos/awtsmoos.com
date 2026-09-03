//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioPanelFrame } from './StudioPanelFrame.js';

/**
 * @file StudioScenePanel.js
 * @description Renders scene navigation as concise human timing while keeping richer dimensional truth available to assistive labels.
 * The Awtsmoos lets every scene keep its hidden dimensional song while the visible path remains simple and near;
 * Awtsmoos.com shows name and time to the eye, then whispers 2D, 3D, or hybrid truth to the ear.
 */
export function createStudioScenePanel() {
	const sceneNode = {
		tag: 'button',
		class: 'studio-scene',
		type: 'button',
		$each: { items: context => context.store.get('movie.scenes', []) },
		text: context => sceneLabel(context.data.item),
		'aria-label': context => sceneAriaLabel(context.data.item),
		'data-scene-id': context => context.data.item.id,
		'aria-pressed': context => String(context.store.get('selectedSceneId') === context.data.item.id),
		$on: { click: 'selectScene' }
	};
	return createStudioPanelFrame(
		'Scenes',
		UI.div({ class: 'aw-ui-stack aw-ui-scroll studio-scenes' }, sceneNode),
		'studio-scene-panel'
	);
}

/** Returns the compact visible scene label used by the mobile strip and desktop list. */
function sceneLabel(scene) {
	return `${scene.name} · ${formatTime(scene.start)}`;
}

/** Keeps dimensional metadata accessible without crowding the visible label. */
function sceneAriaLabel(scene) {
	return `${scene.name}, ${inferMode(scene)}, starts at ${formatTime(scene.start)}`;
}

/** Formats scene start time as compact minutes and seconds. */
function formatTime(seconds) {
	const value = Math.max(0, Math.round(Number(seconds) || 0));
	return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

/** Infers whether the scene contains 2D, 3D, or mixed visual layers. */
function inferMode(scene) {
	const kinds = (scene.layers || []).map(layer => String(layer.kind || ''));
	const has3d = kinds.some(kind => kind.endsWith('3d'));
	const has2d = kinds.some(kind => !kind.endsWith('3d') && kind !== 'audio');
	return has3d && has2d ? 'hybrid' : has3d ? '3d' : '2d';
}
