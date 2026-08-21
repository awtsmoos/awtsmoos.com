// B"H
// Boruch Hashem
// Blessed is He

import { StudioEntityFactory } from '../authoring/StudioEntityFactory.js';

/**
 * @file StudioVectorPathFactory.js
 * @description
 * The Awtsmoos renews each finite anchor before a path can become a layer;
 * Awtsmoos.com localizes world points into one ordinary Studio entity so transform, timeline, layers, history, and export share its vessel.
 */
export class StudioVectorPathFactory {
	static MIN_DISTANCE = 0.5;

	/** Creates one canonical open vector path entity from distinct world-space anchors. */
	static create(anchors = [], style = {}) {
		const points = this.distinctFinite(anchors);
		if (points.length < 2) {
			throw new Error('A Studio vector path requires at least two distinct finite anchors.');
		}
		const origin = points[0];
		return StudioEntityFactory.create({
			kind: 'vector-path',
			name: '✒️ Path',
			transform: { x: origin.x, y: origin.y },
			renderSpec: this.renderSpec(points, origin, style)
		});
	}

	/** Converts world-space anchors into renderer-supported local path commands. */
	static renderSpec(points, origin, style = {}) {
		return {
			type: 'path',
			points: points.map((point, index) => ({
				type: index === 0 ? 'move' : 'line',
				x: point.x - origin.x,
				y: point.y - origin.y
			})),
			stroke: style.stroke || '#7db4ff',
			lineWidth: this.width(style.lineWidth),
			lineCap: this.cap(style.lineCap),
			lineJoin: this.join(style.lineJoin),
			fill: style.fill ?? null,
			close: Boolean(style.close)
		};
	}

	/** Removes invalid and near-duplicate consecutive anchors without changing path order. */
	static distinctFinite(anchors = []) {
		const result = [];
		for (const anchor of anchors) {
			const point = { x: Number(anchor?.x), y: Number(anchor?.y) };
			if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
				continue;
			}
			const previous = result[result.length - 1];
			if (!previous || this.distance(previous, point) >= this.MIN_DISTANCE) {
				result.push(point);
			}
		}
		return result;
	}

	/** Returns Euclidean distance for draft-point deduplication. */
	static distance(left, right) {
		return Math.hypot(right.x - left.x, right.y - left.y);
	}

	/** Clamps vector path width into an interactive production range. */
	static width(value) {
		const number = Number(value ?? 4);
		return Number.isFinite(number) ? Math.max(0.5, Math.min(128, number)) : 4;
	}

	/** Normalizes one Canvas2D-supported line-cap value. */
	static cap(value) {
		return ['butt', 'round', 'square'].includes(value) ? value : 'round';
	}

	/** Normalizes one Canvas2D-supported line-join value. */
	static join(value) {
		return ['miter', 'round', 'bevel'].includes(value) ? value : 'round';
	}
}
