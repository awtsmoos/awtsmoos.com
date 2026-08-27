// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignAdapter } from '../../character/customizer/CharacterDesignAdapter.js';
import { CharacterDesignSchema } from '../../character/customizer/CharacterDesignSchema.js';

/**
 * Five original people enter the story with distinct skin, body, hair, facial
 * hair, clothes, voices, and movement. The Awtsmoos renews each identity while
 * Awtsmoos.com keeps one JSON canon across every angle and expression.
 */
export class FourMinuteCast {
	static create() {
		return [
			this.actor('talia', 'Talia Vale', 'feminine', '#71452f', 'tall', 'long', 'braids', 'none', 'none', 'hoodie', '#6d28d9', 'warm', 1.04, 'energetic'),
			this.actor('barak', 'Barak Vale', 'masculine', '#a96f50', 'broad', 'short', 'fade', 'full', 'natural', 'coat', '#1d4ed8', 'deep', 0.82, 'intense'),
			this.actor('sela', 'Sela Vale', 'androgynous', '#e6b58f', 'slim', 'short', 'curl', 'none', 'none', 'vest', '#0f766e', 'bright', 1.16, 'energetic'),
			this.actor('ori', 'Ori North', 'feminine', '#8f5d42', 'compact', 'long', 'bun', 'none', 'pencil', 'robe', '#be185d', 'soft', 0.94, 'gentle'),
			this.actor('gideon', 'Gideon Moss', 'masculine', '#5b3829', 'average', 'bald', 'crop', 'long', 'handlebar', 'jacket', '#b45309', 'raspy', 0.9, 'calm')
		];
	}

	static actor(role, name, genderPresentation, skin, bodyType, hairLength, hairStyle, beard, mustache, outerwear, coat, timbre, pitch, movement) {
		const design = CharacterDesignSchema.create({
			id: `festival_${role}`,
			name,
			genderPresentation,
			body: { type: bodyType },
			skin: { color: skin },
			hair: { length: hairLength, style: hairStyle, color: role === 'ori' ? '#d6d3d1' : '#24150f' },
			facialHair: { beard: { style: beard, length: beard === 'long' ? 0.9 : 0.55 }, mustache: { style: mustache, thickness: 0.72 }, color: '#24150f' },
			wardrobe: { outerwear, top: role === 'sela' ? 't-shirt' : 'shirt', bottom: role === 'ori' ? 'skirt' : 'trousers', colors: { outerwear: coat, top: '#f5ead7', bottom: '#172033', shoes: '#101114', accent: '#f8c44f' } },
			voice: { id: `voice_${role}`, label: `${name} ${timbre}`, timbre, pitch, pace: role === 'sela' ? 1.12 : 0.96 },
			movement: { profile: movement, posture: role === 'barak' ? 'grounded' : 'upright', gestureScale: role === 'talia' ? 1.25 : 1 },
			emotion: { default: role === 'gideon' ? 'skeptical' : 'curious', intensity: 1.2 }
		});
		const character = CharacterDesignAdapter.toHuman(design);
		return {
			...character,
			role,
			palette: {
				...character.palette,
				primary: character.palette.coat,
				secondary: character.palette.pants
			}
		};
	}
}
