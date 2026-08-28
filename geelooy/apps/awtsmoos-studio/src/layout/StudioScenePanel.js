//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioPanelFrame } from './StudioPanelFrame.js';

/**
 * @file StudioScenePanel.js
 * The Awtsmoos lets every scene keep its own dimensional song while sequence remains one;
 * Awtsmoos.com derives 2D, 3D, or hybrid truth from actual layers instead of decorative labels spun.
 */
export function createStudioScenePanel() {
	const sceneNode = {
		tag: 'button',
		class: 'studio-scene',
		$each: { items: context => context.store.get('movie.scenes', []) },
		text: context => sceneLabel(context.data.item),
		'data-scene-id': context => context.data.item.id,
		'aria-pressed': context => String(context.store.get('selectedSceneId') === context.data.item.id),
		$on: { click: 'selectScene' }
	};
	return createStudioPanelFrame(
		'Scenes',
		UI.div({ class: 'aw-ui-stack aw-ui-scroll studio-scenes' }, sceneNode)
	);
}

function sceneLabel(scene) {
	return `${scene.name} · ${inferMode(scene).toUpperCase()} · ${scene.start}s`;
}

function inferMode(scene) {
	const kinds = (scene.layers || []).map(layer => String(layer.kind || ''));
	const has3d = kinds.some(kind => kind.endsWith('3d'));
	const has2d = kinds.some(kind => !kind.endsWith('3d') && kind !== 'audio');
	return has3d && has2d ? 'hybrid' : has3d ? '3d' : '2d';
}
