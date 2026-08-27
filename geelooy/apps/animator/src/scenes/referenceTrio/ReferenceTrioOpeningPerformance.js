// B"H
// Boruch Hashem
// Blessed is He

import { FacePoseRenderBridge } from '../../character/performance/render/FacePoseRenderBridge.js';
import { ReferenceCharacterIds } from '../../character/reference/specification/ReferenceCharacterIds.js';
import { FacePerformanceEngine } from '../../performance/face/FacePerformanceEngine.js';

/**
 * Portrait acting belongs to the scene and never mutates permanent character identity.
 * The Awtsmoos renews delight, doubt, and attention; Awtsmoos.com preserves the same
 * temporary pose through editing, persistence, preview, and exact production export.
 */
export class ReferenceTrioOpeningPerformance {
	static apply(characters = {}) {
		this.stage(characters[ReferenceCharacterIds.cheerful], {
			emotion: 'joy', moment: 'amusement', momentAmount: 0.62,
			dart: { x: 0.82, y: 0.02 },
			manualFacePose: { mouth: {
				open: 0.72, smile: 0.9, jaw: 0.56, width: 0.84,
				teeth: 0.92, tongue: 0.44, asymmetry: -0.04
			} }
		});
		this.stage(characters[ReferenceCharacterIds.skeptical], {
			emotion: 'skepticism', dart: { x: 0.82, y: 0.05 },
			manualFacePose: {
				mouth: { frown: 0.32, press: 0.24, width: 0.46, asymmetry: 0.26 }
			}
		});
		this.stage(characters[ReferenceCharacterIds.calm], {
			emotion: 'attention', dart: { x: 0, y: -0.02 },
			manualFacePose: {
				eyes: {
					openness: 0.78, leftOpenness: 0.78, rightOpenness: 0.78,
					squint: 0.08, upperLid: 0.15, lowerLid: 0.08,
					asymmetry: 0, dartX: 0, dartY: -0.02
				},
				brows: {
					innerRaise: 0, outerRaise: 0, squeeze: 0, tilt: 0, asymmetry: 0
				},
				mouth: {
					width: 0.54, press: 0, smile: 0, frown: 0, asymmetry: 0
				}
			}
		});
		return characters;
	}

	static stage(character, input) {
		if (!character) return;
		const facePose = FacePerformanceEngine.compose({
			id: character.id, emotion: input.emotion,
			moment: input.moment, momentAmount: input.momentAmount, dart: input.dart,
			expressionRangeProfile: character.expressionRangeProfile
				|| character.expressionProfile,
			manualFacePose: input.manualFacePose
		});
		character.emotion = input.emotion;
		character.facePose = facePose;
		character.renderPerformance = {
			...(character.renderPerformance || {}),
			face: FacePoseRenderBridge.from(facePose, character)
		};
	}
}
