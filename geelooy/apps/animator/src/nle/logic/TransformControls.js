// B"H
// Boruch Hashem
// Blessed is He

import { KeyframeEngine } from '../core/KeyframeEngine.js';

/**
 * Position, scale, rotation, and opacity become one transform vocabulary. The
 * Awtsmoos renews the object while keyframes preserve its measured journey.
 */
export class TransformControls {
	constructor(state) {
		this.state = state;
		this.selectedObject = null;
	}

	/** Selects the scene vessel receiving transform gestures. */
	select(object) {
		this.selectedObject = object;
		this.state.set?.('selectedObject', object);
		return object;
	}

	/** Applies one direct manipulation mode with camera-aware movement. */
	update(deltaX, deltaY, mode = 'translate') {
		const item = this.selectedObject?.item;
		if (!item) {
			return null;
		}
		const camera = this.state.get?.('camera') || {};
		const zoom = Math.max(0.01, Number(camera.zoom) || 1);
		const parallax = this.parallax(this.selectedObject.type);
		if (mode === 'translate') {
			item.x = Number(item.x || 0) + deltaX / (zoom * parallax);
			item.y = Number(item.y || 0) + deltaY / (zoom * parallax);
		}
		if (mode === 'scale') {
			item.scaleX = Math.max(0.01, Number(item.scaleX || 1) + deltaX / 200);
			item.scaleY = Math.max(0.01, Number(item.scaleY || 1) + deltaY / 200);
		}
		if (mode === 'rotate') {
			item.rotation = Number(item.rotation || 0) + deltaX * 0.5;
		}
		if (mode === 'opacity') {
			item.opacity = Math.max(0, Math.min(1, Number(item.opacity ?? 1) + deltaY / 200));
		}
		this.state.notify?.('scene');
		return item;
	}

	/** Stores or replaces one arbitrary property keyframe. */
	keyframe(property, timeMs, value = undefined, easing = 'easeInOut') {
		const item = this.selectedObject?.item;
		if (!item) {
			return null;
		}
		item.keyframes ||= {};
		const channel = item.keyframes[property] || [];
		const frame = { time: Number(timeMs) || 0, value: value ?? item[property], easing };
		item.keyframes[property] = [...channel.filter((entry) => entry.time !== frame.time), frame]
			.sort((left, right) => left.time - right.time);
		this.state.notify?.('scene');
		return frame;
	}

	/** Evaluates all stored channels into the selected object. */
	evaluate(timeMs) {
		const item = this.selectedObject?.item;
		if (!item?.keyframes) {
			return item || null;
		}
		Object.assign(item, KeyframeEngine.evaluate(item.keyframes, timeMs));
		return item;
	}

	parallax(type) {
		if (type === 'building') {
			return 0.7;
		}
		if (type === 'mountain') {
			return 0.2;
		}
		return 1;
	}
}
