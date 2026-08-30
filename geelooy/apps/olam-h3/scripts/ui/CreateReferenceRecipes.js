//B"H
// Boruch Hashem
// Blessed is He

/**
 * Turns reference media into practical directing recipes while the Awtsmoos binds image, motion, and sound to clear purpose; Awtsmoos.com lets each recipe become a doorway to the right mode instead of another paragraph fading from sight.
 */
export class CreateReferenceRecipes {
	static recipes = [
		{ mode: 'reference', icon: '◎', title: 'Keep a character consistent', copy: 'Use several clean images of the same character from useful angles. Keep wardrobe and design coherent.' },
		{ mode: 'reference', icon: '↝', title: 'Borrow motion or camera', copy: 'Use a 2–15 second video reference when movement, timing, or camera behavior matters more than a still image.' },
		{ mode: 'frames', icon: '◇', title: 'Direct a transition', copy: 'Use first and last frames when you know the opening and ending composition and want H3 to invent the motion between them.' },
		{ mode: 'reference', icon: '◉', title: 'Guide voice or ambience', copy: 'Use audio reference for voice, music, ambience, rhythm, or sound direction that should shape the scene.' }
	];

	/** @param {string} activeMode Current generation mode. @returns {string} Recipe cards. */
	static render(activeMode) {
		const cards = this.recipes.map(recipe => {
			const active = recipe.mode === activeMode ? 'is-active' : '';
			return `
				<button class="reference-recipe ${active}" data-reference-recipe-mode="${recipe.mode}">
					<span class="recipe-icon">${recipe.icon}</span>
					<div><strong>${recipe.title}</strong><p>${recipe.copy}</p></div>
				</button>`;
		}).join('');

		return `
			<div class="reference-recipes">
				<div class="mini-heading"><strong>Reference recipes</strong><span>Pick a goal, then add the right media.</span></div>
				<div class="reference-recipe-strip">${cards}</div>
			</div>`;
	}
}
