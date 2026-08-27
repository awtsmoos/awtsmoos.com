// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasEyePainter } from './HumanCanvasEyePainter.js';
import { HumanCanvasFaceDetailPainter } from './HumanCanvasFaceDetailPainter.js';

/**
 * The legacy feature facade keeps callers stable while focused painters reveal
 * eye attention, facial planes, mouth performance, and cheek warmth separately.
 */
export class HumanCanvasFeaturePainter {
	static eye(ctx, x, y, size, pose, face, color) {
		HumanCanvasEyePainter.paint(ctx, x, y, size, pose, face, color);
	}

	static nose(ctx, head, face, scale, skin) {
		HumanCanvasFaceDetailPainter.nose(ctx, head, face, scale, skin);
	}

	static mouth(ctx, head, face, pose, scale, color) {
		HumanCanvasFaceDetailPainter.mouth(
			ctx,
			head,
			face,
			pose,
			scale,
			color
		);
	}

	static cheeks(ctx, head, radiusX, face, character, scale) {
		HumanCanvasFaceDetailPainter.cheeks(
			ctx,
			head,
			radiusX,
			face,
			character,
			scale
		);
	}
}
