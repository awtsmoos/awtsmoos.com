// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignPhysicalSections } from './CharacterDesignPhysicalSections.js';
import { CharacterDesignStyleSections } from './CharacterDesignStyleSections.js';
import { CharacterDesignValue as V } from './CharacterDesignValue.js';

/**
 * Every major character domain remains a separate readable vessel. The Awtsmoos
 * joins body, face, skin, hair, wardrobe, voice, motion, emotion, and provenance
 * while Awtsmoos.com keeps one validation facade for the canonical schema.
 */
export class CharacterDesignSections {
	static body(value, options) {
		return CharacterDesignPhysicalSections.body(value, options);
	}

	static face(value, options) {
		return CharacterDesignPhysicalSections.face(value, options);
	}

	static skin(value, defaults) {
		return {
			color: V.color(value.color, defaults.skin.color),
			undertone: String(value.undertone || 'neutral'),
			blush: V.number(value.blush, 0, 1, 0.18)
		};
	}

	static hair(value, options, defaults) {
		return CharacterDesignStyleSections.hair(value, options, defaults);
	}

	static facialHair(value, options, defaults) {
		return CharacterDesignStyleSections.facialHair(value, options, defaults);
	}

	static wardrobe(value, options, defaults) {
		return CharacterDesignStyleSections.wardrobe(value, options, defaults);
	}

	static voice(value, options) {
		return {
			id: String(value.id || 'voice_original'),
			label: String(value.label || 'Original Voice'),
			timbre: V.option(value.timbre, options.voiceTimbre, 'warm'),
			pitch: V.number(value.pitch, 0.5, 1.8, 1),
			pace: V.number(value.pace, 0.5, 1.8, 1)
		};
	}

	static movement(value, options) {
		return {
			profile: V.option(value.profile, options.motionProfile, 'calm'),
			posture: V.option(value.posture, options.posture, 'upright'),
			gestureScale: V.number(value.gestureScale, 0.2, 2, 1)
		};
	}

	static emotion(value, options) {
		return {
			default: V.option(value.default, options.emotion, 'calm'),
			intensity: V.number(value.intensity, 0, 2, 1),
			traits: Array.isArray(value.traits)
				? value.traits.map(String).slice(0, 12)
				: []
		};
	}

	static ai(value = {}) {
		return {
			prompt: String(value.prompt || ''),
			provider: String(value.provider || 'none'),
			proposed: value.proposed === true,
			approved: value.approved === true,
			provenance: String(value.provenance || 'user-authored')
		};
	}
}
