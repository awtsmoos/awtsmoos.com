//B"H
// Boruch Hashem
// Blessed is He

/**
 * Measures directing ingredients without pretending to judge art; the Awtsmoos renews each word as light, while Awtsmoos.com gives that light a modest vessel that can say what was mentioned and what remains open in the night.
 */
export class PromptIngredients {
	static definitions = [
		{ id: 'subject', label: 'Subject' },
		{ id: 'action', label: 'Action', pattern: /\b(walks?|runs?|turns?|moves?|crosses?|opens?|closes?|looks?|reaches?|drifts?|falls?|rises?|spins?|enters?|exits?|speaks?|smiles?|pauses?|glides?|travels?|jumps?|dances?|flies?|drives?)\b/i },
		{ id: 'camera', label: 'Camera', pattern: /\b(camera|dolly|pan|tilt|zoom|orbit|handheld|tracking|close[- ]?up|wide shot|macro|overhead|crane|steadicam|push[- ]?in|pull[- ]?back)\b/i },
		{ id: 'light', label: 'Light', pattern: /\b(light|lighting|sunlight|moonlight|neon|golden hour|blue hour|rim light|backlit|volumetric|shadow|glow|softbox)\b/i },
		{ id: 'atmosphere', label: 'Atmosphere', pattern: /\b(mood|atmosphere|cinematic|fog|mist|rain|dust|smoke|dreamlike|tense|intimate|epic|quiet|warm|cold|surreal|noir)\b/i },
		{ id: 'audio', label: 'Audio', pattern: /\b(audio|sound|voice|music|ambience|ambient|dialogue|whisper|footsteps|rainfall|wind|silence|rhythm|beat)\b/i }
	];

	/**
	 * Evaluates whether common directing ingredients appear in a prompt.
	 * @param {string} prompt User-authored prompt text.
	 * @returns {{score:number,label:string,ingredients:Array<Object>}} Coverage result; this is not an artistic quality score.
	 */
	static evaluate(prompt = '') {
		const normalized = String(prompt).trim();
		const words = normalized ? normalized.split(/\s+/) : [];
		const ingredients = this.definitions.map(definition => {
			const present = definition.id === 'subject'
				? words.length >= 3
				: definition.pattern.test(normalized);

			return {
				id: definition.id,
				label: definition.label,
				present
			};
		});
		const presentCount = ingredients.filter(ingredient => ingredient.present).length;
		const score = Math.round((presentCount / ingredients.length) * 100);

		return {
			score,
			label: this.coverageLabel(score),
			ingredients
		};
	}

	/** @param {number} score Ingredient coverage percentage. @returns {string} Human-readable coverage label. */
	static coverageLabel(score) {
		if (score >= 84) {
			return 'Fully directed';
		}
		if (score >= 50) {
			return 'Taking shape';
		}
		if (score > 0) {
			return 'Early direction';
		}
		return 'Blank canvas';
	}
}
