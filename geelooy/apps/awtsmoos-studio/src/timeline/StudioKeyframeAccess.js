//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioKeyframeAccess.js
 * The Awtsmoos renews motion from timeless source while Awtsmoos.com records finite moments in the shared MovieDocument keyframe tongue;
 * this adapter honors scene and layer offsets so authored points agree with the canonical sampler when playback is begun.
 */

export const STUDIO_KEYFRAME_CHANNELS = Object.freeze([
	'transform.x',
	'transform.y',
	'transform.z',
	'transform.rotationX',
	'transform.rotationY',
	'transform.rotationZ',
	'transform.scaleX',
	'transform.scaleY',
	'transform.scaleZ',
	'transform.opacity'
]);

export function studioLayerLocalTime(playhead, scene, layer) {
	return Math.max(0, Number(playhead || 0) - Number(scene?.start || 0) - Number(layer?.start || 0));
}

export function getStudioChannelValue(layer, channel) {
	const key = String(channel || '').replace(/^transform\./, '');
	return layer?.transform?.[key] ?? 0;
}

export function upsertStudioKeyframe(layer, channel, at, value, easing = 'ease-in-out') {
	const frames = Array.isArray(layer.keyframes) ? [...layer.keyframes] : [];
	const index = frames.findIndex(frame => frame.channel === channel && Math.abs(Number(frame.at) - Number(at)) < 0.001);
	const frame = { at: Number(at), channel, value: structuredClone(value), easing };
	if (index >= 0) frames[index] = frame;
	else frames.push(frame);
	layer.keyframes = frames.sort((left, right) => Number(left.at) - Number(right.at));
	return frame;
}

export function removeStudioKeyframe(layer, channel, at) {
	layer.keyframes = (layer.keyframes || []).filter(frame => !(frame.channel === channel && Math.abs(Number(frame.at) - Number(at)) < 0.001));
}
