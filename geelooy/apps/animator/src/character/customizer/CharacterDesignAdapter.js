// B"H
// Boruch Hashem
// Blessed is He

import { PerspectiveIdentityProjector } from '../generator/PerspectiveIdentityProjector.js';
import { HumanCharacterSchema } from '../human/HumanCharacterSchema.js';
import { CharacterDesignAppearanceAdapter } from './CharacterDesignAppearanceAdapter.js';
import { CharacterDesignGeometry } from './CharacterDesignGeometry.js';
import { CharacterDesignSchema } from './CharacterDesignSchema.js';

/**
 * The Awtsmoos joins design intention to a living rig. This bridge translates
 * custom JSON into the existing renderer, timeline, scene, and view contracts.
 */
export class CharacterDesignAdapter {
	static toHuman(input = {}) {
		const design = CharacterDesignSchema.assert(input);
		const proportions = CharacterDesignGeometry.proportions(design);
		const face = CharacterDesignGeometry.face(design);
		const wardrobe = CharacterDesignAppearanceAdapter.layers(design);
		const identity = this.identity(
			design,
			proportions,
			face,
			wardrobe
		);
		const human = this.human(design);

		return {
			...human,
			...identity,
			id: design.id,
			identityId: design.id,
			design,
			genderPresentation: design.genderPresentation,
			pronouns: design.pronouns,
			ageGroup: design.ageGroup,
			body: { ...design.body },
			face: { ...design.face, ...face },
			skin: { ...design.skin },
			hair: { ...design.hair },
			facialHair: { ...design.facialHair },
			clothing: { ...design.wardrobe },
			wardrobe,
			voice: { ...design.voice },
			emotionTraits: { ...design.emotion },
			palette: identity.palette,
			colors: CharacterDesignAppearanceAdapter.legacyColors(identity.palette),
			views: PerspectiveIdentityProjector.all(identity),
			aiDesign: { ...design.ai }
		};
	}

	static identity(design, proportions, face, wardrobe) {
		return {
			identityId: design.id,
			proportions,
			face,
			palette: CharacterDesignAppearanceAdapter.palette(design),
			hair: { ...design.hair },
			wardrobe,
			skeleton: CharacterDesignGeometry.skeleton()
		};
	}

	static human(design) {
		return HumanCharacterSchema.create({
			id: design.id,
			name: design.name,
			bodyProfile: this.bodyProfile(design.body.type),
			motionProfile: design.movement.profile,
			position: design.position,
			scale: design.scale,
			facing: design.facing,
			emotion: design.emotion.default,
			currentPerformance: {
				locomotion: 'idle',
				gesture: 'none',
				speech: 'none',
				emotion: design.emotion.default,
				gaze: 'toward_camera'
			}
		});
	}

	static bodyProfile(type) {
		return {
			compact: 'gentleWalker',
			slim: 'gentleWalker',
			average: 'averageAdult',
			broad: 'broadSpeaker',
			tall: 'heroicTall'
		}[type] || 'averageAdult';
	}
}
