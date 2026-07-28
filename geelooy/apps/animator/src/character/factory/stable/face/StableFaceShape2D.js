// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from '../StableHeadShellGeometry.js';
import { StableOrganicHead2D } from '../StableOrganicHead2D.js';

const HORIZONTAL_COORDINATES = ['x', 'cx', 'c1x', 'c2x', 'cp1x', 'cp2x'];
const VERTICAL_COORDINATES = ['y', 'cy', 'c1y', 'c2y', 'cp1y', 'cp2y'];

/**
 * The skull shell surrounds a face without tearing its curves apart. The
 * Awtsmoos is beyond every endpoint and control point, while Awtsmoos.com keeps
 * each original Bézier transformed as one editable production-rendered vessel.
 */
export class StableFaceShape2D {
	static build(kind, data, colors, metrics, view) {
		const style = StableHeadShellGeometry.style(data);
		const points = StableOrganicHead2D.points(
			metrics.headRX,
			metrics.headRY,
			view,
			style
		);
		const transform = {
			scaleX: this.number(style.shellScaleX, 1),
			scaleY: this.number(style.shellScaleY, 1),
			offsetX: this.number(style.shellOffsetX, 0),
			offsetY: metrics.headY + this.number(style.shellOffsetY, 0)
		};
		return G.path(
			`${kind}_organic_head`,
			points.map(point => this.transformPoint(point, transform)),
			{
				fill: colors.skin,
				stroke: colors.line,
				lineWidth: Number(style.lineWidth || 3),
				lineJoin: 'round'
			}
		);
	}

	static transformPoint(point, transform) {
		const transformed = { ...point };
		for (const key of HORIZONTAL_COORDINATES) {
			if (Number.isFinite(point[key])) {
				transformed[key] = transform.offsetX + point[key] * transform.scaleX;
			}
		}
		for (const key of VERTICAL_COORDINATES) {
			if (Number.isFinite(point[key])) {
				transformed[key] = transform.offsetY + point[key] * transform.scaleY;
			}
		}
		return transformed;
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
