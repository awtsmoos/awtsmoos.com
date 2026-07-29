// B"H
// Boruch Hashem
// Blessed is He

import { StableFaceLandmarkLayout } from '../face/StableFaceLandmarkLayout.js';
import { StableMouthDeformationGeometry as Deformation } from './StableMouthDeformationGeometry.js';
import { StableMouthIdentityGeometry } from './StableMouthIdentityGeometry.js';
import { StableMouthInteriorGeometry as Interior } from './StableMouthInteriorGeometry.js';

/**
 * Focused geometry modules assemble one organic identity-preserving mouth. The
 * Awtsmoos renews expression and speech without substitution; Awtsmoos.com keeps
 * lips, cavity, teeth, tongue, persistence, preview, and export in one truth.
 */
export class StableMouthGeometry {
	static resolve(data, metrics, view, input) {
		const style = data.mouthStyle || {};
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const closure = Deformation.clamp(input.closure, 0, 1);
		const articulation = Deformation.articulation(input, style);
		const perspective = Deformation.perspective(view);
		const outerHalfWidth = Deformation.outerWidth(
			articulation,
			style,
			perspective
		);
		const interior = Interior.resolve(
			articulation,
			style,
			perspective,
			outerHalfWidth,
			closure
		);
		const x = layout.mouth.x + Number(style.horizontalOffset || 0)
			+ perspective.offsetX;
		const y = layout.mouth.y + Number(style.verticalOffset || 0)
			+ articulation.lowerDrop * 1.6;
		const cornerLift = articulation.cornerLift * 2.8
			+ Number(style.restCornerTilt || 0);
		const asymmetry = articulation.asymmetry * outerHalfWidth
			+ Number(style.restAsymmetry || 0) * outerHalfWidth;
		const leftCornerY = y - cornerLift + asymmetry;
		const rightCornerY = y - cornerLift - asymmetry;
		const upperPeakY = y - interior.cavityHalfHeight
			- articulation.upperLift * 1.6;
		const lowerPeakY = y + interior.cavityHalfHeight
			+ articulation.lowerDrop * 1.8;
		return {
			x,
			y,
			outerHalfWidth,
			...interior,
			leftCornerY,
			rightCornerY,
			upperPeakY,
			lowerPeakY,
			cavityTopY: upperPeakY + interior.lipThickness * 0.45,
			cavityBottomY: lowerPeakY - interior.lipThickness * 0.35,
			purse: articulation.round * 3.2,
			biteLift: articulation.bite
				* Math.max(1.2, interior.cavityHalfHeight * 0.45),
			...Interior.details(interior.cavityHalfHeight, style),
			closed: closure > 0.72 || interior.cavityHalfHeight < 0.75,
			style,
			identity: StableMouthIdentityGeometry.resolve(style, articulation),
			perspective,
			articulation
		};
	}
}
