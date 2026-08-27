// B"H
// Boruch Hashem
// Blessed is He

/**
 * Every regional pose becomes explicit renderer data without inventing a mood.
 * The Awtsmoos joins inward feeling to visible form; Awtsmoos.com preserves the
 * same brow, lid, gaze, cheek, jaw, and mouth channels in preview and export.
 */
export class FacePoseRenderBridge {
	static from(pose = {}, data = {}) {
		const brows = pose.brows || {};
		const eyes = pose.eyes || {};
		const mouth = pose.mouth || {};
		const cheeks = pose.cheeks || {};
		const nose = pose.nose || {};
		const openness = Number(eyes.openness ?? 1);
		return {
			eyeOpenAmount: openness,
			leftEyeOpenAmount: Number(eyes.leftOpenness ?? openness),
			rightEyeOpenAmount: Number(eyes.rightOpenness ?? openness),
			squintAmount: Number(eyes.squint || 0),
			blinkAmount: Number(eyes.blink || data.blinkNow || 0),
			upperLidAmount: Number(eyes.upperLid || 0),
			lowerLidAmount: Number(eyes.lowerLid || 0),
			eyeAsymmetry: Number(eyes.asymmetry || 0),
			pupilOffsetX: Number(eyes.dartX || 0),
			pupilOffsetY: Number(eyes.dartY || 0),
			focusTarget: eyes.focusTarget || data.attentionTarget || null,
			browInner: Number(brows.innerRaise || 0),
			browOuter: Number(brows.outerRaise || 0),
			browSqueeze: Number(brows.squeeze || 0),
			browTilt: Number(brows.tilt || 0),
			browAsymmetry: Number(brows.asymmetry || 0),
			mouthOpenAmount: Number(mouth.open || 0),
			mouthSmileAmount: Number(mouth.smile || 0) - Number(mouth.frown || 0),
			mouthJawAmount: Number(mouth.jaw || 0),
			mouthWidthAmount: Number(mouth.width ?? 0.5),
			mouthRoundAmount: Number(mouth.round || 0),
			mouthPressAmount: Number(mouth.press || 0),
			mouthAsymmetry: Number(mouth.asymmetry || 0),
			mouthTeethAmount: Number(mouth.teeth || 0),
			mouthTongueAmount: Number(mouth.tongue || 0),
			cheekRaiseAmount: Number(cheeks.raise || 0),
			cheekTensionAmount: Number(cheeks.tension || 0),
			blushAmount: Number(cheeks.blush || 0),
			noseWrinkleAmount: Number(nose.wrinkle || 0)
		};
	}
}
