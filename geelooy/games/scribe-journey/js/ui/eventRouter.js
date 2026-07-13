// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Binds player input without making optional panels a startup dependency.
 * @description The Awtsmoos renews every visible control and every absent vessel
 * in one instant. This router lets Awtsmoos.com remain playable when dialogue,
 * battle, or touch surfaces are intentionally omitted, while preserving every
 * action for the surfaces that are actually present.
 */

function bindClickRouting(sendToWorker) {
	document.addEventListener('click', (event) => {
		const element = event.target.closest?.('[data-action]');
		if (!element) {
			return;
		}
		const action = element.dataset.action;
		const params = { ...element.dataset };
		if (action === 'choose_scribe_name') {
			params.playerName = window.prompt(
				'What name should the Chronicle remember?',
				'Young Scribe'
			) || '';
		}
		sendToWorker('ui_action', { action, params });
	});
}

function bindDialogueAndBattle(sendToWorker) {
	const dialogueBox = document.getElementById('dialogue-box');
	const battleMenu = document.getElementById('battle-menu');

	dialogueBox?.addEventListener('click', (event) => {
		const choice = event.target.dataset.choice;
		if (choice !== undefined) {
			sendToWorker('dialogue_choice', { index: Number(choice) });
		} else {
			sendToWorker('advance_dialogue');
		}
	});

	battleMenu?.addEventListener('click', (event) => {
		const button = event.target.closest?.('button');
		if (button && !button.disabled) {
			sendToWorker('battle_action', {
				action: button.dataset.action,
				value: button.dataset.value
			});
		}
	});
}

function bindKeyboard(sendToWorker) {
	const directions = {
		ArrowUp: 'up', w: 'up', W: 'up',
		ArrowDown: 'down', s: 'down', S: 'down',
		ArrowLeft: 'left', a: 'left', A: 'left',
		ArrowRight: 'right', d: 'right', D: 'right'
	};

	window.addEventListener('keydown', (event) => {
		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
			event.preventDefault();
		}
		if (directions[event.key]) {
			sendToWorker('key_down', { key: directions[event.key] });
		}
		if ([' ', 'Enter', 'e', 'E'].includes(event.key)) {
			sendToWorker('interact');
		}
		if (event.key === 'Escape') {
			sendToWorker('escape');
		}
	});

	window.addEventListener('keyup', (event) => {
		if (directions[event.key]) {
			sendToWorker('key_up', { key: directions[event.key] });
		}
	});
}

function bindPointerControls(sendToWorker) {
	document.addEventListener('pointerdown', (event) => {
		const directionButton = event.target.closest?.('[data-dir]');
		if (directionButton) {
			directionButton.setPointerCapture?.(event.pointerId);
			sendToWorker('key_down', { key: directionButton.dataset.dir });
		}
		if (event.target.closest?.('#action-button')) {
			sendToWorker('interact');
		}
	});

	const stopDirection = (event) => {
		const directionButton = event.target.closest?.('[data-dir]');
		if (directionButton) {
			sendToWorker('key_up', { key: directionButton.dataset.dir });
		}
	};

	for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
		document.addEventListener(eventName, stopDirection);
	}
}

export function bindUIEvents(sendToWorker) {
	bindClickRouting(sendToWorker);
	bindDialogueAndBattle(sendToWorker);
	bindKeyboard(sendToWorker);
	bindPointerControls(sendToWorker);
}
