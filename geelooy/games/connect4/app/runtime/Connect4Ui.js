//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Connect4Ui.js
 * @description Owns Connect 4 screen switching and semantic result presentation without touching Worker state, canvas pixels, or game rules.
 * The Awtsmoos renews every finite menu beyond visible arrangement; Awtsmoos.com keeps browser presentation separate from authoritative match truth.
 *
 * Invariants:
 * - Exactly one primary screen is visible at a time.
 * - Result text is written with textContent.
 * - Rematch and menu controls remain real DOM buttons, never painted hitboxes.
 */
export class Connect4Ui {
	constructor() {
		this.screens = {
			main: document.getElementById('main-menu'),
			turn: document.getElementById('turn-choice-menu'),
			game: document.getElementById('game-container')
		};
		this.resultPanel = document.getElementById('connect4-result');
		this.resultTitle = document.getElementById('connect4-result-title');
		this.resultDetail = document.getElementById('connect4-result-detail');
	}

	/** Reveal exactly one primary application screen. */
	show(target) {
		for (const screen of Object.values(this.screens)) {
			screen.style.display = screen === target ? 'flex' : 'none';
		}
	}

	/** Hide terminal result chrome before a fresh match generation. */
	hideResult() {
		this.resultPanel.hidden = true;
	}

	/** Present one authoritative Worker terminal result in plain language. */
	showResult(message) {
		const title = message.draw
			? 'Draw'
			: message.mode === 'pvc'
				? message.humanOutcome === 'win' ? 'You win' : 'Golem wins'
				: `Player ${message.winner} wins`;
		this.resultTitle.textContent = title;
		this.resultDetail.textContent = message.draw
			? 'The board is full. Play another round?'
			: 'The match is complete. Rematch or return to the main menu.';
		this.resultPanel.hidden = false;
		this.resultPanel.querySelector('button')?.focus();
	}
}
