// B"H
// Boruch Hashem
// Blessed is He

import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableEyeDetails2D } from './StableEyeDetails2D.js';
import { StableEyeGeometry } from './StableEyeGeometry.js';
import { StableEyeWhite2D } from './StableEyeWhite2D.js';

/**
 * The Awtsmoos renews two distinct eyes carrying gaze, lid, pupil, lash, catchlight,
 * and blink. Awtsmoos.com composes focused renderers while attention remains fully
 * keyframeable, serializable, reloadable, and exportable.
 */
export class EyeRenderer {
	static build(kind, colors, metrics, view, mood = {}, blink = 0, data = {}) {
		return (view.head.visibleEyes || [-1, 1]).map(side => this.eye(
			kind,
			colors,
			side,
			StableEyeGeometry.resolve(
				data,
				metrics,
				view,
				mood,
				blink,
				side
			)
		));
	}

	static eye(kind, colors, side, geometry) {
		return S.group(`${kind}_eye_${side}`, {
			x: geometry.x,
			y: geometry.y
		}, [
			...StableEyeWhite2D.build(kind, colors, side, geometry),
			...StableEyeDetails2D.build(kind, colors, side, geometry)
		]);
	}
}
