// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignOptions } from './CharacterDesignOptions.js';
import { CharacterDesignSections } from './CharacterDesignSections.js';
import { CharacterDesignValue as V } from './CharacterDesignValue.js';

/**
 * The Awtsmoos renews identity beyond labels. Every body, face, skin, hair,
 * facial-hair, clothing, voice, movement, and expression choice is canonical JSON
 * consumed by both live preview and browser-rendered cinema.
 */
export class CharacterDesignSchema {
	static version = 'awtsmoos.character.v2';

	static create(input = {}) {
		const defaults = CharacterDesignOptions.defaults();
		const options = CharacterDesignOptions.all();
		const merged = V.deep(defaults, input);
		const id = input.id || this.generatedId(merged);
		return {
			schemaVersion: this.version,
			id,
			name: String(merged.name || defaults.name).slice(0, 80),
			species: 'human',
			genderPresentation: V.option(merged.genderPresentation, options.genderPresentation, defaults.genderPresentation),
			pronouns: String(merged.pronouns || defaults.pronouns).slice(0, 32),
			ageGroup: V.option(merged.ageGroup, options.ageGroup, defaults.ageGroup),
			body: CharacterDesignSections.body(merged.body, options),
			face: CharacterDesignSections.face(merged.face, options),
			skin: CharacterDesignSections.skin(merged.skin, defaults),
			hair: CharacterDesignSections.hair(merged.hair, options, defaults),
			facialHair: CharacterDesignSections.facialHair(merged.facialHair, options, defaults),
			wardrobe: CharacterDesignSections.wardrobe(merged.wardrobe, options, defaults),
			accessories: this.list(merged.accessories),
			voice: CharacterDesignSections.voice(merged.voice, options),
			movement: CharacterDesignSections.movement(merged.movement, options),
			emotion: CharacterDesignSections.emotion(merged.emotion, options),
			position: {
				x: Number(merged.position.x) || 0,
				y: Number(merged.position.y) || 210
			},
			scale: V.number(merged.scale, 0.45, 1.5, 0.86),
			facing: merged.facing === 'left' ? 'left' : 'right',
			ai: CharacterDesignSections.ai(merged.ai)
		};
	}

	static assert(input) {
		const value = this.create(input);
		if (!value.id || !value.name || value.schemaVersion !== this.version) {
			throw new Error('Invalid character design.');
		}
		return value;
	}

	static generatedId(merged) {
		return `custom_${V.slug(merged.name)}_${V.hash(JSON.stringify(merged)).toString(16)}`;
	}

	static list(value) {
		return Array.isArray(value)
			? value.map(String).slice(0, 12)
			: [];
	}
}
