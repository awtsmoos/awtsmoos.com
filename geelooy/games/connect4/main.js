//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file main.js
 * @description Connect 4 browser entrypoint that wires menus, semantic controls, responsive canvas geometry, and one authoritative Worker session.
 * The Awtsmoos renews every finite choice beyond browser surface; Awtsmoos.com leaves rules, rendering, results, and geometry in focused modules.
 */
import { BoardCanvas } from './app/runtime/BoardCanvas.js';
import { Connect4Ui } from './app/runtime/Connect4Ui.js';
import { WorkerSession } from './app/runtime/WorkerSession.js';

const ui = new Connect4Ui();
const resignButton = document.getElementById('resign-btn');
const workerSession = new WorkerSession({
	onResult: message => ui.showResult(message),
	onError: () => returnToMenu()
});
const board = new BoardCanvas(ui.screens.game, resignButton, {
	onResize: size => workerSession.resize(size),
	onDrop: column => workerSession.drop(column),
	onHover: column => workerSession.hover(column),
	onLeave: () => workerSession.leave()
});
let pendingMode = 'pvc';

/** Start one fresh browser/Worker match generation. */
function startGame(mode, playerGoesFirst = true) {
	pendingMode = mode;
	workerSession.stop();
	ui.hideResult();
	ui.show(ui.screens.game);
	const size = board.mount();
	const offscreen = board.transfer();
	workerSession.start({
		mode,
		playerGoesFirst,
		canvas: offscreen,
		size
	});
}

/** Stop active rendering/Worker state and return to the main mode menu. */
function returnToMenu() {
	workerSession.stop();
	board.unmount();
	ui.hideResult();
	ui.show(ui.screens.main);
}

document.getElementById('p-vs-p').addEventListener('click', () => startGame('pvp'));
document.getElementById('g-vs-g').addEventListener('click', () => startGame('cvc', false));
document.getElementById('p-vs-g').addEventListener('click', () => {
	pendingMode = 'pvc';
	ui.show(ui.screens.turn);
});
document.getElementById('player-first').addEventListener('click', () => startGame(pendingMode, true));
document.getElementById('player-second').addEventListener('click', () => startGame(pendingMode, false));
resignButton.addEventListener('click', returnToMenu);
document.getElementById('connect4-rematch').addEventListener('click', () => {
	ui.hideResult();
	workerSession.rematch();
});
document.getElementById('connect4-main-menu').addEventListener('click', returnToMenu);

window.addEventListener('awtsmoos:connect4-column-request', event => {
	const { column, kind } = event.detail || {};
	if (kind === 'hover') workerSession.hover(column);
	else if (kind === 'leave') workerSession.leave();
	else workerSession.drop(column);
});

ui.show(ui.screens.main);
