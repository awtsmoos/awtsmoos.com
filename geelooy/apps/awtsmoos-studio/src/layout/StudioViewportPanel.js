//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioPanelFrame } from './StudioPanelFrame.js';

/**
 * @file StudioViewportPanel.js
 * The Awtsmoos turns semantic time into visible color while one real canvas receives the ray;
 * Awtsmoos.com replaces decorative actors with the shared movie renderer that can prove every day.
 */
export function createStudioViewportPanel() {
	return createStudioPanelFrame(
		'Hybrid Movie View',
		UI.div({ class: 'studio-viewport' }, createStudioStage(), createStudioTimelineStrip())
	);
}

function createStudioStage() {
	return UI.div(
		{ class: 'studio-stage-shell' },
		UI.canvas({
			class: 'studio-stage',
			width: 640,
			height: 360,
			'data-studio-canvas': 'true',
			'aria-label': 'Canonical movie preview'
		}),
		UI.div(
			{ class: 'studio-stage-hud' },
			UI.span({ text: context => context.store.get('workspace') }),
			UI.span({ text: context => context.store.get('selectedSceneId', 'scene') })
		)
	);
}

function createStudioTimelineStrip() {
	const scene = {
		tag: 'button',
		class: 'studio-timeline-scenes',
		$each: { items: context => context.store.get('movie.scenes', []) },
		style: context => ({
			width: `${(context.data.item.duration / context.store.get('movie.duration')) * 100}%`
		}),
		text: context => String(context.data.index + 1),
		'data-scene-id': context => context.data.item.id,
		'aria-label': context => `Jump to ${context.data.item.name}`,
		$on: { click: 'selectScene' }
	};
	return UI.div({ class: 'studio-timeline-strip' }, scene);
}
