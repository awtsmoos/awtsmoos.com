// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos is beyond every human description, yet renews each designed
 * person with stable data. Awtsmoos.com preserves both legacy performance fields
 * and the richer custom identity that now clothes, colors, voices, and moves it.
 */
export class HumanCharacterSchema {
	static create(data = {}) {
		const id = data.id || `human_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
		const performance = data.currentPerformance || {};
		return {
			...data,
			id,
			species: 'human',
			style: data.style || 'cartoon_realistic',
			name: data.name || id,
			genderPresentation: data.genderPresentation || 'androgynous',
			pronouns: data.pronouns || 'they/them',
			ageGroup: data.ageGroup || 'adult',
			bodyProfile: data.bodyProfile || 'averageAdult',
			motionProfile: data.motionProfile || data.movement?.profile || 'calm',
			clothingProfile: data.clothingProfile || 'customWardrobe',
			faceProfile: data.faceProfile || 'customFace',
			position: {
				x: Number(data.position?.x) || 0,
				y: Number(data.position?.y) || 0
			},
			scale: Number(data.scale) || 1,
			facing: data.facing === 'left' ? 'left' : 'right',
			body: { ...(data.body || {}) },
			face: { ...(data.face || {}) },
			skin: { ...(data.skin || {}) },
			hair: { ...(data.hair || {}) },
			facialHair: { ...(data.facialHair || {}) },
			clothing: { ...(data.clothing || {}) },
			voice: { ...(data.voice || {}) },
			currentPerformance: {
				locomotion: performance.locomotion || data.action || 'idle',
				gesture: performance.gesture || data.gesture || 'none',
				speech: performance.speech || data.speech || 'none',
				emotion: performance.emotion || data.emotion || 'calm',
				gaze: performance.gaze || data.gaze || 'toward_camera'
			},
			dialogue: data.dialogue || '',
			speaking: Boolean(data.speaking),
			selectable: data.selectable !== false,
			nle: {
				trackGroup: data.nle?.trackGroup || id,
				color: data.nle?.color || '#00f0ff'
			}
		};
	}

	static normalize(character = {}) {
		return this.create({ ...character, id: character.id });
	}
}
