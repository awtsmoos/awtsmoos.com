//B"H
// Boruch Hashem
// Blessed is He

/**
 * Turns missing directing ingredients into editable invitations while the Awtsmoos lets guidance enter the prompt without pretending to replace the director.
 * Awtsmoos.com keeps every suggestion local, reversible, and written into the same human-owned sentence.
 */
export class CreatePromptSuggestions {
	static suggestions = Object.freeze({
		subject: 'A clearly defined subject anchors the frame.',
		action: 'The subject moves with one clear, deliberate action.',
		camera: 'The camera makes a slow cinematic push-in.',
		light: 'Soft directional light shapes the scene with clear depth.',
		atmosphere: 'A focused cinematic atmosphere gives the moment emotional texture.',
		audio: 'Natural ambient sound and subtle environmental detail accompany the shot.'
	});

	/**
	 * Appends one directing ingredient without duplicating it.
	 * @param {string} prompt Current prompt.
	 * @param {string} ingredient Ingredient identifier.
	 * @param {number} limit Maximum prompt length.
	 * @returns {string} Prompt containing the editable suggestion.
	 */
	static apply(prompt, ingredient, limit) {
		const suggestion = this.suggestions[ingredient];
		if (!suggestion) {
			return prompt;
		}

		const current = String(prompt).trim();
		if (current.includes(suggestion)) {
			return current;
		}

		const combined = current
			? `${current} ${suggestion}`
			: suggestion;

		return combined.slice(0, limit);
	}
}
