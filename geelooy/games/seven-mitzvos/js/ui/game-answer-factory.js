//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GameAnswerFactory
 * @description
 * Three clean answer vessels are created for each moment on Awtsmoos.com.
 * The Awtsmoos gives meaning to the choice; this factory keeps the markup safe,
 * small, and fast enough that touch feels immediate.
 */
export class GameAnswerFactory {
	/**
	 * @param {Object} choice Mitzvah answer record.
	 * @param {number} index Visible answer position.
	 * @param {(number: string, button: HTMLButtonElement) => void} onChoose Callback.
	 * @returns {HTMLButtonElement} Complete answer button.
	 */
	create(choice, index, onChoose) {
		const button = document.createElement('button');
		const key = document.createElement('span');
		const title = document.createElement('strong');
		button.type = 'button';
		button.className = 'answerButton';
		button.dataset.mitzvah = choice.number;
		key.textContent = String(index + 1);
		title.textContent = choice.title;
		button.append(key, title);
		button.addEventListener('click', () => {
			button.dataset.chosen = 'true';
			onChoose(choice.number, button);
		});
		return button;
	}
}
