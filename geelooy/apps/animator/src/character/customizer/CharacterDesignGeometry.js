// B"H
// Boruch Hashem
// Blessed is He

import { CharacterPresentationProfile } from './CharacterPresentationProfile.js';

/**
 * One identity remains recognizable through front, profile, rear, posture, and
 * motion. The Awtsmoos renews every proportion while explicit custom JSON can
 * refine or override the gentle presentation tendencies applied here.
 */
export class CharacterDesignGeometry {
	static proportions(design) {
		const body = design.body;
		const face = design.face;
		const presentation = CharacterPresentationProfile.resolve(
			design.genderPresentation
		);
		const head = this.head(face.shape);
		return {
			headWidth: head.width,
			headHeight: head.height,
			shoulderWidth: body.shoulderWidth
				* this.bodyFactor(body.type, 'shoulder')
				* presentation.shoulder,
			hipWidth: body.hipWidth * presentation.hip,
			waistWidth: body.waistDefinition * presentation.waist,
			chestDepth: body.chestDepth,
			torsoHeight: body.height * this.bodyFactor(body.type, 'torso'),
			legLength: body.height
				* body.legLength
				* this.bodyFactor(body.type, 'leg')
		};
	}

	static face(design) {
		const presentation = CharacterPresentationProfile.resolve(
			design.genderPresentation
		);
		return {
			eyeSeparation: { narrow: 0.4, almond: 0.46, round: 0.48, wide: 0.55, hooded: 0.45 }[design.face.eyeShape] || 0.46,
			eyeScale: design.face.eyeShape === 'wide'
				? 1.14
				: design.face.eyeShape === 'narrow' ? 0.86 : 1,
			lashCount: design.genderPresentation === 'feminine'
				? 4
				: design.genderPresentation === 'androgynous' ? 2 : 1,
			jawWidth: design.face.jawWidth * presentation.jaw,
			jawSoftness: design.face.jawSoftness,
			chinLength: design.face.chinLength,
			noseBridge: design.face.noseBridge,
			noseProjection: design.face.noseProjection,
			lipFullness: design.face.lipFullness,
			cheekFullness: design.face.cheekFullness * presentation.cheek,
			browWeight: design.face.browWeight * presentation.brow,
			eyelidWeight: design.face.eyelidWeight
		};
	}

	static head(shape) {
		return {
			round: { width: 1.08, height: 0.96 },
			oval: { width: 0.98, height: 1.04 },
			square: { width: 1.06, height: 0.98 },
			heart: { width: 1.02, height: 1.02 },
			long: { width: 0.9, height: 1.16 }
		}[shape] || { width: 1, height: 1 };
	}

	static skeleton() {
		return [
			['root', null, 0, 0.82],
			['hips', 'root', 0, 0.66],
			['chest', 'hips', 0, 0.42],
			['neck', 'chest', 0, 0.2],
			['head', 'neck', 0, 0],
			['shoulderL', 'chest', -0.28, 0.34],
			['elbowL', 'shoulderL', -0.42, 0.52],
			['wristL', 'elbowL', -0.46, 0.7],
			['shoulderR', 'chest', 0.28, 0.34],
			['elbowR', 'shoulderR', 0.42, 0.52],
			['wristR', 'elbowR', 0.46, 0.7],
			['kneeL', 'hips', -0.16, 1.02],
			['ankleL', 'kneeL', -0.18, 1.34],
			['kneeR', 'hips', 0.16, 1.02],
			['ankleR', 'kneeR', 0.18, 1.34]
		].map(([id, parent, x, y]) => ({ id, parent, x, y, depth: 0 }));
	}

	static bodyFactor(type, dimension) {
		const map = {
			compact: { shoulder: 0.88, torso: 0.86, leg: 0.82 },
			slim: { shoulder: 0.86, torso: 1, leg: 1.04 },
			average: { shoulder: 1, torso: 1, leg: 1 },
			broad: { shoulder: 1.18, torso: 1.05, leg: 0.98 },
			tall: { shoulder: 1.02, torso: 1.12, leg: 1.2 }
		};
		return map[type]?.[dimension] || 1;
	}
}
