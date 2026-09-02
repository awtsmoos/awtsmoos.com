//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTrackLane.js
 * The Awtsmoos renews layer into time while Awtsmoos.com lets media, graphics, worlds, voice, and keyframes occupy safe declarative lanes;
 * CSS variables now pass through AwtsmoosUI's guarded style vessel as objects, so motion may shine without breaking the renderer's protective chains.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

/** Build one reusable track row descriptor from canonical timeline items. */
export function createStudioTrackLane() {
	const keyframe = {
		tag: 'span',
		class: 'studio-clip-keyframe',
		title: context => context.data.item.channel,
		style: context => createKeyframeStyle(context.data.item),
	};
	const clip = {
		tag: 'button',
		class: 'studio-track-clip',
		'data-scene-id': context => context.data.item.sceneId,
		'data-layer-id': context => context.data.item.layerId,
		'data-layer-start': context => context.data.item.start,
		'aria-pressed': context => String(context.store.get('selectedLayerId') === context.data.item.layerId),
		style: context => createClipStyle(context.data.item, context.store.get('movie.duration')),
		$on: { click: 'selectTimelineLayer' },
		children: [
			{ tag: 'strong', text: context => context.data.item.label },
			{ tag: 'span', text: context => `${context.data.item.kind} · ${context.data.item.duration}s` },
			{ tag: 'div', class: 'studio-clip-keyframes', children: [{ ...keyframe, $each: { items: context => context.data.item.keyframeMarks || [] } }] }
		]
	};
	return {
		tag: 'div',
		class: 'studio-track-row',
		children: [
			{ tag: 'div', class: 'studio-track-header', children: [{ tag: 'strong', text: context => context.data.item.label }, { tag: 'span', text: context => `${context.data.item.items.length}` }] },
			{ tag: 'div', class: 'studio-track-content', children: [{ ...clip, $each: { items: context => context.data.item.items } }] }
		]
	};
}

/** Translate clip timing into safe declarative CSS custom properties. */
export function createStudioClipStyle(item, duration) {
	return createClipStyle(item, duration);
}

/** Translate a keyframe mark into one safe declarative CSS custom property. */
export function createStudioKeyframeStyle(mark) {
	return createKeyframeStyle(mark);
}

function createClipStyle(item, duration) {
	const total = Math.max(0.001, Number(duration || 0));
	const left = Math.max(0, Number(item.start || 0)) / total * 100;
	const width = Math.max(0.6, Number(item.duration || 0) / total * 100);
	return {
		'--clip-left': `${left}%`,
		'--clip-width': `${width}%`
	};
}

function createKeyframeStyle(mark) {
	return {
		'--key-left': `${Number(mark.left || 0)}%`
	};
}
