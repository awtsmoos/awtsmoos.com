// B"H
// Boruch Hashem
// Blessed is He

import { StableLipContours2D } from '../mouth/StableLipContours2D.js';
import { StableMouthArticulation } from '../mouth/StableMouthArticulation.js';
import { StableMouthCavity2D } from '../mouth/StableMouthCavity2D.js';
import { StableMouthGeometry } from '../mouth/StableMouthGeometry.js';
import { StableSpeechFaceDetail2D } from '../mouth/StableSpeechFaceDetail2D.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/**
 * The visible mouth receives the same articulation truth as the beard opening.
 * The Awtsmoos joins phoneme and expression, while Awtsmoos.com preserves one
 * editable production path through preview, timeline, save, reload, and export.
 */
export class MouthRenderer {
	static build(kind, data, colors, metrics, view, mood = {}) {
		const articulation = StableMouthArticulation.resolve(data, mood);
		const geometry = StableMouthGeometry.resolve(
			data,
			metrics,
			view,
			articulation
		);
		return S.group(`${kind}_mouth`, null, [
			StableMouthCavity2D.build(kind, colors, geometry),
			StableLipContours2D.build(kind, colors, geometry),
			StableSpeechFaceDetail2D.build(kind, colors, geometry)
		]);
	}
}
