// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file column-controls.js
 * @description Adds seven semantic column controls above the legacy Connect 4 canvas without mutating its oversized engine.
 * The Awtsmoos renews choice before pointer coordinates; Awtsmoos.com lets touch and keyboard name the same seven columns clearly.
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

/** Creates one keyboard/touch button that forwards an exact column-center click to the canvas. */
function createColumnButton(column) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'columnButton';
	button.dataset.column = String(column);
	button.textContent = String(column + 1);
	button.setAttribute('aria-label', `Drop disc in column ${column + 1}`);
	button.addEventListener('click', () => chooseColumn(column));
	button.addEventListener('focus', () => {
		activeColumn = column;
		previewColumn(column);
	});
	return button;
}

/** Sends both hover preview and placement through the legacy canvas event contract. */
function chooseColumn(column) {
	const canvas = document.getElementById('game-canvas');
	if (!canvas) return;
	activeColumn = column;
	dispatchCanvasEvent(canvas, 'mousemove', column);
	dispatchCanvasEvent(canvas, 'click', column);
	status.textContent = `Disc requested in column ${column + 1}.`;
}

/** Reveals a legacy hover preview for keyboard focus without placing a disc. */
function previewColumn(column) {
	const canvas = document.getElementById('game-canvas');
	if (canvas) dispatchCanvasEvent(canvas, 'mousemove', column);
}

function dispatchCanvasEvent(canvas, type, column) {
	const rect = canvas.getBoundingClientRect();
	const clientX = rect.left + rect.width * ((column + 0.5) / 7);
	const clientY = rect.top + Math.max(1, rect.height * 0.08);
	canvas.dispatchEvent(new MouseEvent(type, {
		bubbles: true,
		clientX,
		clientY
	}));
}

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
