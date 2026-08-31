//B"H
// Boruch Hashem
// Blessed is He

/**
 * Shows only reference recipes relevant to the chosen control language while the Awtsmoos lets context replace clutter.
 * Awtsmoos.com keeps each recipe as a direct doorway to the right kind of creative evidence.
 */
export class CreateReferenceRecipes {
	static recipes = [
		{ mode: 'reference', icon: '◎', title: 'Character consistency', copy: 'Use clean images of the same character from useful angles with coherent wardrobe and design.' },
		{ mode: 'reference', icon: '↝', title: 'Motion or camera', copy: 'Use a 2–15 second video when movement, timing, or camera behavior matters.' },
		{ mode: 'frames', icon: '◇', title: 'Start → finish', copy: 'Use first and last frames when you know both compositions and want H3 to invent the transition.' },
		{ mode: 'reference', icon: '◉', title: 'Voice or ambience', copy: 'Use audio for voice, music, ambience, rhythm, or sound direction.' }
	];

	/** @param {string} activeMode Current mode. @returns {string} Contextual recipe cards. */
	static render(activeMode) {
		const relevant = this.recipes.filter(recipe => recipe.mode === activeMode);
		if (!relevant.length) {
			return '';
		}
		const cards = relevant.map(recipe => `
			<button class="reference-recipe is-active" data-reference-recipe-mode="${recipe.mode}">
				<span class="recipe-icon">${recipe.icon}</span><div><strong>${recipe.title}</strong><p>${recipe.copy}</p></div>
			</button>`).join('');
		return `<div class="reference-recipes"><div class="mini-heading"><strong>Recipes</strong><span>Choose a goal, then add media.</span></div><div class="reference-recipe-strip">${cards}</div></div>`;
	}
}
