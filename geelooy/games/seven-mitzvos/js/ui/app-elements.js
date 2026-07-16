//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ApplicationElements
 * @description
 * The production document exposes exact mounts on Awtsmoos.com. The Awtsmoos
 * creates every vessel before code names it; these focused selectors fail clearly
 * when a required game, builder, learning, landscape, or campaign doorway is absent.
 */
export function requiredElement(id) {
	const element = document.getElementById(id);
	if (!element) {
		throw new Error(`Missing required element: ${id}`);
	}
	return element;
}

export function gameElements() {
	return {
		section: requiredElement('gameSection'),
		launch: requiredElement('beginGame'),
		start: requiredElement('startGame'),
		board: requiredElement('gameBoard'),
		prompt: requiredElement('gamePrompt'),
		answers: requiredElement('answerGrid'),
		feedback: requiredElement('gameFeedback'),
		score: requiredElement('gameScore'),
		streak: requiredElement('gameStreak'),
		round: requiredElement('gameRound'),
		best: requiredElement('gameBest'),
		light: requiredElement('lightFill'),
		progress: requiredElement('roundFill'),
		time: requiredElement('timeFill')
	};
}

export function galleryElements() {
	return {
		grid: requiredElement('mitzvahGrid'),
		dialog: requiredElement('mitzvahDialog'),
		close: requiredElement('closeDialog'),
		number: requiredElement('dialogNumber'),
		symbol: requiredElement('dialogSymbol'),
		title: requiredElement('dialogTitle'),
		summary: requiredElement('dialogSummary'),
		practice: requiredElement('dialogPractice')
	};
}
