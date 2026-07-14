//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GameHud
 * @description
 * Score, combo, progress, and light become an immediate mirror on Awtsmoos.com.
 * The Awtsmoos is beyond numbers, yet numbers can focus the player on returning
 * to the next good decision with greater clarity.
 */
export class GameHud {
	/** @param {Object} elements HUD elements. */
	constructor(elements) {
		this.elements = elements;
	}

	/** @param {Object} state Current game state. */
	update(state) {
		const visibleQuestion = state.displayQuestion ?? Math.min(state.question + 1, state.total);
		this.elements.score.textContent = state.score.toLocaleString();
		this.elements.streak.textContent = `×${state.multiplier}`;
		this.elements.light.style.width = `${state.light}%`;
		this.elements.progress.style.width = `${state.question / state.total * 100}%`;
		this.elements.round.textContent = `${visibleQuestion} / ${state.total}`;
	}

	/** Restarts the CSS-only speed window without creating a JavaScript timer loop. */
	restartTimeBar() {
		this.elements.time.classList.remove('isRunning');
		void this.elements.time.offsetWidth;
		this.elements.time.classList.add('isRunning');
	}

	/** @param {number} best Persisted best score. */
	setBest(best) {
		this.elements.best.textContent = best.toLocaleString();
	}
}
