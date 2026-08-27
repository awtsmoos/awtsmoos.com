// B"H
// Boruch Hashem
// Blessed is He

import { BrowRenderer } from '../face/brows/BrowRenderer.js';
import { BrowSystem } from '../face/brows/BrowSystem.js';
import { EyeSystem } from '../face/EyeSystem.js';
import { MouthSystem } from '../face/MouthSystem.js';
import { HumanCanvasFacialHairPainter } from './HumanCanvasFacialHairPainter.js';
import { HumanCanvasFeaturePainter } from './HumanCanvasFeaturePainter.js';
import { HumanCanvasHairPainter } from './HumanCanvasHairPainter.js';
import { HumanCanvasHeadShapePainter } from './HumanCanvasHeadShapePainter.js';

/**
 * Expression is the main performance vessel: eyes attend, brows anticipate,
 * cheeks lift, nose projects, jaw shapes, lips speak, and hair follows the face.
 */
export class HumanCanvasFacePainter {
	static paint(ctx, head, radius, character, colors, scale, time, index) {
		const face = character.face || character.design?.face || {};
		const ratio = HumanCanvasHeadShapePainter.ratio(face.shape);
		const radiusX = radius * ratio.x;
		const radiusY = radius * ratio.y;
		HumanCanvasHeadShapePainter.paint(
			ctx,
			head,
			radiusX,
			radiusY,
			face,
			colors.skin
		);
		HumanCanvasHairPainter.paint(
			ctx,
			head,
			radiusX,
			radiusY,
			character,
			colors,
			scale,
			time
		);
		const eyePose = EyeSystem.sample(character, time, index);
		const eye = this.eyeSize(face.eyeShape, scale);
		const separation = (face.eyeSeparation || 0.46) * radiusX;
		HumanCanvasFeaturePainter.eye(
			ctx,
			head.x - separation,
			head.y - 5 * scale,
			eye,
			eyePose,
			face,
			colors.eye
		);
		HumanCanvasFeaturePainter.eye(
			ctx,
			head.x + separation,
			head.y - 5 * scale,
			eye,
			eyePose,
			face,
			colors.eye
		);
		this.brows(ctx, head, face, character, colors, scale, time, index);
		HumanCanvasFeaturePainter.nose(ctx, head, face, scale, colors.skin);
		HumanCanvasFeaturePainter.cheeks(ctx, head, radiusX, face, character, scale);
		HumanCanvasFeaturePainter.mouth(
			ctx,
			head,
			face,
			MouthSystem.sample(character, time),
			scale,
			colors.mouth
		);
		HumanCanvasFacialHairPainter.paint(
			ctx,
			head,
			radiusX,
			radiusY,
			character,
			scale
		);
	}

	static brows(ctx, head, face, character, colors, scale, time, index) {
		BrowRenderer.draw(ctx, {
			x: head.x,
			y: head.y - 17 * scale,
			scale: scale * Number(face.browWeight || 1),
			pose: BrowSystem.sample(character, time, index),
			color: colors.brow
		});
	}

	static eyeSize(shape, scale) {
		const ratio = {
			round: [7, 7],
			almond: [8, 5.5],
			wide: [9, 6],
			narrow: [8, 3.8],
			hooded: [8, 4.5]
		}[shape] || [7, 6];
		return {
			x: ratio[0] * scale,
			y: ratio[1] * scale,
			pupil: 2.7 * scale,
			scale
		};
	}
}
