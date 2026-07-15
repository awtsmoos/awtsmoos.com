// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignAdapter } from '../../character/customizer/CharacterDesignAdapter.js';
import { CharacterDesignSchema } from '../../character/customizer/CharacterDesignSchema.js';

/**
 * Six original people carry different ages, silhouettes, histories, and ways of
 * moving through danger. The Awtsmoos renews each identity while Awtsmoos.com
 * preserves one detailed design canon through every shot and expression.
 */
export class SixMinuteCast {
	static create() {
		return [
			this.actor('noa', 'Noa Lior', 'feminine', '#8b563d', 'compact', 'long', 'braids', 'none', 'none', 'jacket', '#e85d75', 'bright', 1.08, 'kinetic'),
			this.actor('aron', 'Aron Lior', 'masculine', '#9b6549', 'broad', 'short', 'curl', 'short', 'natural', 'hoodie', '#2659a8', 'warm', 0.88, 'grounded'),
			this.actor('leah', 'Leah Sivan', 'feminine', '#5f392d', 'tall', 'medium', 'locs', 'none', 'none', 'coat', '#0f8b8d', 'deep', 0.92, 'precise'),
			this.actor('mira', 'Mira Halevi', 'androgynous', '#d19a72', 'slim', 'short', 'crop', 'none', 'none', 'vest', '#5b8c3a', 'soft', 1.02, 'fluid'),
			this.actor('jonah', 'Jonah Keshet', 'masculine', '#6e4434', 'average', 'medium', 'wave', 'boxed', 'pencil', 'jacket', '#c66a16', 'raspy', 0.96, 'athletic'),
			this.actor('ezra', 'Ezra Vale', 'masculine', '#e0b18b', 'average', 'bald', 'crop', 'long', 'handlebar', 'coat', '#6d4ba5', 'calm', 0.82, 'measured')
		];
	}

	static actor(role, name, genderPresentation, skin, bodyType, hairLength, hairStyle, beard, mustache, outerwear, coat, timbre, pitch, movement) {
		const design = CharacterDesignSchema.create({
			id: `beacon_${role}`,
			name,
			genderPresentation,
			body: { type: bodyType },
			skin: { color: skin },
			hair: { length: hairLength, style: hairStyle, color: role === 'ezra' ? '#c9c3ba' : '#22150f' },
			facialHair: { beard: { style: beard, length: beard === 'long' ? 0.88 : 0.42 }, mustache: { style: mustache, thickness: 0.68 }, color: '#24150f' },
			wardrobe: { outerwear, top: 'shirt', bottom: 'trousers', colors: { outerwear: coat, top: '#efe5d3', bottom: '#172033', shoes: '#101218', accent: '#f3c64d' } },
			voice: { id: `voice_${role}`, label: `${name} ${timbre}`, timbre, pitch, pace: role === 'noa' ? 1.12 : 0.96 },
			movement: { profile: movement, posture: role === 'aron' ? 'grounded' : 'upright', gestureScale: role === 'noa' ? 1.28 : 1 },
			emotion: { default: role === 'ezra' ? 'skeptical' : 'curious', intensity: 1.28 }
		});
		const character = CharacterDesignAdapter.toHuman(design);
		return { ...character, role, palette: { ...character.palette, primary: character.palette.coat, secondary: character.palette.pants } };
	}
}
