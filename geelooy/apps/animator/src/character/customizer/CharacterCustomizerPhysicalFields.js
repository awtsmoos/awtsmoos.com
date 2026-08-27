// B"H
// Boruch Hashem
// Blessed is He

import { CharacterCustomizerField as F } from './CharacterCustomizerField.js';

/**
 * Body and face remain directly editable beyond broad presentation tendencies.
 * The Awtsmoos renews shoulder, hip, waist, chest, jaw, cheek, eye, nose, lip,
 * chin, and skin while Awtsmoos.com keeps each control authoritative.
 */
export class CharacterCustomizerPhysicalFields {
	static identity(options) {
		return F.group('Identity', [
			F.text('name', 'Name'),
			F.select('genderPresentation', 'Gender presentation', options.genderPresentation),
			F.text('pronouns', 'Pronouns'),
			F.select('ageGroup', 'Age group', options.ageGroup)
		]);
	}

	static body(options) {
		return F.group('Body & Silhouette', [
			F.select('body.type', 'Body type', options.bodyType),
			F.range('body.height', 'Overall height', 0.7, 1.35),
			F.range('body.shoulderWidth', 'Shoulder width', 0.65, 1.45),
			F.range('body.hipWidth', 'Hip width', 0.65, 1.45),
			F.range('body.waistDefinition', 'Waist definition', 0.65, 1.25),
			F.range('body.chestDepth', 'Chest depth', 0.65, 1.45),
			F.range('body.legLength', 'Leg length', 0.75, 1.3)
		]);
	}

	static face(options) {
		return F.group('Skin & Facial Structure', [
			F.color('skin.color', 'Skin color'),
			F.range('skin.blush', 'Natural blush', 0, 1),
			F.select('face.shape', 'Face shape', options.faceShape),
			F.select('face.eyeShape', 'Eye shape', options.eyeShape),
			F.color('face.eyeColor', 'Eye color'),
			F.select('face.nose', 'Nose shape', options.noseShape),
			F.select('face.mouth', 'Mouth shape', options.mouthShape),
			F.range('face.jawWidth', 'Jaw width', 0.65, 1.4),
			F.range('face.jawSoftness', 'Jaw softness', 0, 1),
			F.range('face.chinLength', 'Chin length', 0.65, 1.4),
			F.range('face.noseBridge', 'Nose bridge', 0.5, 1.5),
			F.range('face.noseProjection', 'Nose projection', 0.5, 1.6),
			F.range('face.lipFullness', 'Lip fullness', 0.55, 1.55),
			F.range('face.cheekFullness', 'Cheek fullness', 0.65, 1.45),
			F.range('face.browWeight', 'Brow weight', 0.4, 1.8),
			F.range('face.eyelidWeight', 'Eyelid weight', 0.55, 1.45)
		]);
	}
}
