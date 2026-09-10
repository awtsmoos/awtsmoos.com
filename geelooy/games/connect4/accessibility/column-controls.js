//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file column-controls.js
 * @description Adds seven semantic Connect 4 column controls and announces only Worker-confirmed turn/result truth.
 * The Awtsmoos renews choice before coordinates; Awtsmoos.com lets touch and keyboard request one column while the authoritative Worker decides what actually happened.
 *
 * Invariants:
 * - Button activation emits semantic column intent, never synthetic canvas clicks.
 * - Status text follows authoritative `awtsmoos:connect4-state` messages.
 * - Controls disable whenever the Worker says the human may not act.
 */
const gameContainer = document.getElementById('game-container');
const controls = document.createElement('div');
const status = document.createElement('p');
let activeColumn = 0;

controls.id = 'column-controls';
controls.className = 'columnControls';
controls.setAttribute('role', 'group');
controls.setAttribute('aria-label', 'Choose a Connect 4 column');
status.id = 'connect4-status';
status.className = 'srOnly';
status.setAttribute('role', 'status');
status.setAttribute('aria-live', 'polite');

gameContainer.prepend(status);
gameContainer.prepend(controls);

for (let column = 0; column < 7; column += 1) {
	controls.append(createColumnButton(column));
}

/** Create one keyboard/touch button that emits semantic column intent. */
function createColumnButton(column) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'columnButton';
	button.dataset.column = String(column);
	button.textContent = String(column + 1);
	button.setAttribute('aria-label', `Drop disc in column ${column + 1}`);
	button.addEventListener('click', () => requestColumn(column, 'drop'));
	button.addEventListener('focus', () => {
		activeColumn = column;
		requestColumn(column, 'hover');
	});
	return button;
}

/** Dispatch one semantic request for the browser Worker session. */
function requestColumn(column, kind) {
	window.dispatchEvent(new CustomEvent('awtsmoos:connect4-column-request', {
		detail: { column, kind }
	}));
}

/** Enable/disable all columns according to authoritative Worker turn state. */
function setEnabled(enabled) {
	for (const button of controls.querySelectorAll('button')) {
		button.disabled = !enabled;
	}
}

/** Translate authoritative Worker state into concise assistive status. */
window.addEventListener('awtsmoos:connect4-state', event => {
	const state = event.detail || {};
	controls.hidden = false;
	setEnabled(Boolean(state.isPlayerTurn) && !state.gameOver);
	if (state.reason === 'terminal') {
		status.textContent = state.draw
			? 'The game is a draw.'
			: `${state.humanOutcome === 'win' ? 'You win.' : state.humanOutcome === 'loss' ? 'Golem wins.' : `Player ${state.winner} wins.`}`;
		return;
	}
	if (state.reason === 'turn-advanced') {
		status.textContent = state.isPlayerTurn
			? `Move accepted. Player ${state.currentPlayer} to move.`
			: 'Move accepted. Golem is thinking.';
		return;
	}
	status.textContent = state.isPlayerTurn
		? `Player ${state.currentPlayer} to move.`
		: 'Waiting for the Golem.';
});

controls.addEventListener('keydown', event => {
	if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
	event.preventDefault();
	if (event.key === 'ArrowLeft') activeColumn = Math.max(0, activeColumn - 1);
	if (event.key === 'ArrowRight') activeColumn = Math.min(6, activeColumn + 1);
	if (event.key === 'Home') activeColumn = 0;
	if (event.key === 'End') activeColumn = 6;
	controls.querySelector(`[data-column="${activeColumn}"]`)?.focus();
});

new MutationObserver(() => {
	controls.hidden = !document.getElementById('game-canvas');
}).observe(gameContainer, { childList: true });
controls.hidden = true;
