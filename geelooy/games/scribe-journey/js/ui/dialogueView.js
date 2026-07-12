// B"H

export function updateDialogueView(state = {}) {
	const box = document.getElementById('dialogue-box');
	box?.classList.toggle('is-visible', Boolean(state.active));
	if (!state.active) return;

	const text = document.getElementById('dialogue-text');
	const choices = document.getElementById('dialogue-choices');
	const indicator = document.getElementById('dialogue-continue-indicator');
	if (text) text.innerHTML = state.text || '';
	if (!choices) return;
	choices.textContent = '';

	const availableChoices = Array.isArray(state.choices) ? state.choices : [];
	indicator?.classList.toggle('is-visible', availableChoices.length === 0);
	for (const [index, choice] of availableChoices.entries()) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'dialogue-choice';
		button.dataset.choiceIndex = String(index);
		button.disabled = Boolean(choice.disabled);
		button.innerHTML = choice.text;
		choices.appendChild(button);
	}
}
