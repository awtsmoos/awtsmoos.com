//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReactionPalette
 * @description The Awtsmoos cannot be reduced to six symbols, so the palette never pretends it can;
 * Awtsmoos.com offers quick sparks plus an arbitrary short emoji field for every human hand.
 */

const QUICK_REACTIONS = Object.freeze(['👍', '❤️', '😂', '🤯', '🙏', '🔥']);

export function createChesedReactionPalette(document, onChoose) {
	const details = document.createElement('details');
	const summary = document.createElement('summary');
	const body = document.createElement('div');
	const quick = document.createElement('div');
	const custom = document.createElement('form');
	const input = document.createElement('input');
	const submit = document.createElement('button');
	details.className = 'awtsmoosReactionPalette';
	summary.textContent = '+ React';
	body.className = 'awtsmoosReactionPalette__body';
	quick.className = 'awtsmoosReactionPalette__quick';
	for (const emoji of QUICK_REACTIONS) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'awtsmoosReactionChoice';
		button.textContent = emoji;
		button.setAttribute('aria-label', `React ${emoji}`);
		button.addEventListener('click', () => onChoose(emoji));
		quick.append(button);
	}
	custom.className = 'awtsmoosReactionPalette__custom';
	input.type = 'text';
	input.maxLength = 32;
	input.inputMode = 'text';
	input.placeholder = 'Any emoji';
	input.setAttribute('aria-label', 'Custom emoji reaction');
	submit.type = 'submit';
	submit.textContent = 'React';
	custom.addEventListener('submit', event => {
		event.preventDefault();
		const value = input.value.trim();
		if (!value) return;
		onChoose(value);
		input.value = '';
	});
	custom.append(input, submit);
	body.append(quick, custom);
	details.append(summary, body);
	return details;
}
