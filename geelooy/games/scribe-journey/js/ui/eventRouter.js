// B"H

function numericValue(value) {
	if (value === undefined || value === '') return value;
	const number = Number(value);
	return Number.isFinite(number) ? number : value;
}

function datasetPayload(button) {
	const payload = {};
	for (const [key, value] of Object.entries(button.dataset)) payload[key] = numericValue(value);
	if (payload.action === 'swapOtzar') {
		payload.action = 'swap_otzar';
		payload.to = payload.from === 'team' ? 'storage' : 'team';
	}
	if (payload.action === 'toggleGate' && !payload.gateId) payload.gateId = payload.value;
	return payload;
}

function questPayload() {
	return {
		type: document.getElementById('quest-type-select')?.value || 'fetch',
		targetId: document.getElementById('quest-target-input')?.value || 'wheat_bundle',
		rewardId: document.getElementById('quest-reward-select')?.value || 'money',
		rewardAmount: Number(document.getElementById('quest-reward-amount')?.value) || 1
	};
}

/** Delegates every screen action through one predictable message gate. */
export function bindUIEvents(sendToWorker) {
	document.body.addEventListener('click', event => {
		const battleButton = event.target.closest('.battle-button');
		if (battleButton) {
			event.preventDefault();
			sendToWorker('battleAction', { combatAction: battleButton.dataset.action, value: battleButton.dataset.value });
			return;
		}

		const choice = event.target.closest('.dialogue-choice');
		if (choice) {
			event.preventDefault();
			sendToWorker('dialogueChoice', { index: Number(choice.dataset.choiceIndex) });
			return;
		}

		const button = event.target.closest('button[data-action]');
		if (!button || button.disabled) return;
		event.preventDefault();
		const action = button.dataset.action;
		if (action === 'create_quest') sendToWorker('create_quest', questPayload());
		else sendToWorker('uiAction', datasetPayload(button));
	});

	const chatHeader = document.getElementById('chat-header');
	chatHeader?.addEventListener('click', () => {
		const chat = document.getElementById('global-chat-box');
		chat?.classList.toggle('minimized');
		const toggle = document.getElementById('chat-toggle');
		if (toggle) toggle.textContent = chat?.classList.contains('minimized') ? '[+]' : '[-]';
	});
}
