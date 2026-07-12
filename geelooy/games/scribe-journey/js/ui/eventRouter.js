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

async function routeImport(input, sendToWorker) {
	const file = input.files?.[0];
	if (!file) return;
	try {
		const text = await file.text();
		sendToWorker('importGame', { text, fileName: file.name });
	} catch {
		sendToWorker('importGame', { text: '', fileName: file.name });
	} finally {
		input.value = '';
	}
}

/** Delegates every screen, setting, battle, and import action through one gate. */
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

	document.body.addEventListener('change', event => {
		const input = event.target;
		if (input.matches('[data-setting]')) {
			const value = input.type === 'checkbox' ? input.checked : numericValue(input.value);
			sendToWorker('updateSetting', { setting: input.dataset.setting, value });
			return;
		}
		if (input.id === 'chronicle-import-input') routeImport(input, sendToWorker);
	});

	const chatHeader = document.getElementById('chat-header');
	chatHeader?.addEventListener('click', () => {
		const chat = document.getElementById('global-chat-box');
		chat?.classList.toggle('minimized');
		const toggle = document.getElementById('chat-toggle');
		if (toggle) toggle.textContent = chat?.classList.contains('minimized') ? '[+]' : '[-]';
	});
}
