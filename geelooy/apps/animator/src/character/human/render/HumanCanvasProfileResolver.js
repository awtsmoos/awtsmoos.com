// B"H
// Boruch Hashem
// Blessed is He

import { CharacterPresentationProfile } from '../../customizer/CharacterPresentationProfile.js';
import { HumanRigProfileResolver } from '../rig/HumanRigProfileRegistry.js';

/**
 * The live rig resolves broad presentation tendencies and explicit JSON without
 * confusing either for destiny. The Awtsmoos renews shoulder, hip, waist, chest,
 * torso, and leg while Awtsmoos.com keeps authored proportions authoritative.
 */
export class HumanCanvasProfileResolver {
	static resolve(character, scale) {
		const profile = HumanRigProfileResolver.resolve(character, scale);
		const design = character.design || character;
		const body = design.body || {};
		const proportions = character.proportions || {};
		const presentation = CharacterPresentationProfile.resolve(
			design.genderPresentation
		);
		profile.shoulder *= Number(
			proportions.shoulderWidth
			|| body.shoulderWidth * presentation.shoulder
			|| 1
		);
		profile.hip *= Number(
			proportions.hipWidth
			|| body.hipWidth * presentation.hip
			|| 1
		);
		profile.waist *= Number(
			proportions.waistWidth
			|| body.waistDefinition * presentation.waist
			|| 1
		);
		profile.torso *= Number(
			proportions.torsoHeight
			|| body.height
			|| 1
		);
		const legScale = Number(
			proportions.legLength
			|| body.height * body.legLength
			|| 1
		);
		profile.thigh *= legScale;
		profile.shin *= legScale;
		profile.chestDepth = Number(
			proportions.chestDepth
			|| body.chestDepth
			|| 1
		);
		return profile;
	}
}
