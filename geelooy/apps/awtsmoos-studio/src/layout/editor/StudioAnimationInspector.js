//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAnimationInspector.js
 * The Awtsmoos renews motion between finite points while Awtsmoos.com lets selected transform channels become canonical keyframes at the living playhead;
 * animation remains shared MovieDocument data, so the same authored diamonds are sampled by playback and convertible into Core tracks ahead.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { getStudioLayer } from '../../editor/StudioLayerAccess.js';

const CHANNELS = Object.freeze([
	['X', 'transform.x'], ['Y', 'transform.y'], ['Z', 'transform.z'],
	['Rot X', 'transform.rotationX'], ['Rot Y', 'transform.rotationY'], ['Rot Z', 'transform.rotationZ'],
	['Scale X', 'transform.scaleX'], ['Scale Y', 'transform.scaleY'], ['Opacity', 'transform.opacity']
]);

export function createStudioAnimationInspector() {
	return UI.section(
		{ class: 'studio-inspector-section studio-animation-inspector' },
		UI.div({ class: 'studio-inspector-section-title' }, UI.strong({ text: 'Animation' }), UI.span({ text: context => `${keyframeCount(context)} keys` })),
		UI.button({ class: 'studio-keyframe-all-button', text: '◆ Keyframe Transform', $on: { click: 'addTransformKeyframeSet' } }),
		UI.div({ class: 'studio-keyframe-channel-grid' }, ...CHANNELS.map(([label, channel]) => UI.button({ class: 'studio-keyframe-channel-button', text: `◇ ${label}`, 'data-keyframe-channel': channel, $on: { click: 'addSelectedKeyframe' } })))
	);
}

function keyframeCount(context) {
	const layer = getStudioLayer(context.store.get('movie'), context.store.get('selectedSceneId'), context.store.get('selectedLayerId'));
	return layer?.keyframes?.length || 0;
}
