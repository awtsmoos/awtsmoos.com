//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file main.js
 * @description Connect 4 browser entrypoint that wires menus, semantic controls,
 * responsive canvas geometry, native 3D, and one prewarmed authoritative Worker.
 * The Awtsmoos prepares transport before finite choice; Awtsmoos.com publishes
 * browser readiness only when the Worker has loaded every gameplay dependency.
 */
import { BoardCanvas } from './app/runtime/BoardCanvas.js';
import { Connect4Ui } from './app/runtime/Connect4Ui.js';
import { Connect4Native3DPresentation } from './app/runtime/Native3DPresentation.js';
import { WorkerSession } from './app/runtime/WorkerSession.js';

const ui = new Connect4Ui();
const resignButton = document.getElementById('resign-btn');
const native3d = new Connect4Native3DPresentation();
const workerSession = new WorkerSession({
	onResult: message => ui.showResult(message),
	onState: message => native3d.update(message.board),
	onError: () => handleWorkerError()
});
const board = new BoardCanvas(ui.screens.game, resignButton, {
	onResize: size => workerSession.resize(size),
	onDrop: column => workerSession.drop(column),
	onHover: column => workerSession.hover(column),
	onLeave: () => workerSession.leave()
});
let pendingMode = 'pvc';

/** Publish menu readiness only after the Worker confirms dependency-loaded boot. */
function prepareMenuWorker() {
	document.body.dataset.connect4Ready = 'false';
	return workerSession.prewarm()
		.then(() => {
			document.body.dataset.connect4Ready = 'true';
		})
		.catch(() => {
			document.body.dataset.connect4Ready = 'error';
		});
}

/** Start one fresh match on the already-prewarmed Worker generation. */
function startGame(mode, playerGoesFirst = true) {
	pendingMode = mode;
	ui.hideResult();
	ui.show(ui.screens.game);
	const size = board.mount();
	native3d.mount(board.canvas);
	const offscreen = board.transfer();
	workerSession.start({ mode, playerGoesFirst, canvas: offscreen, size });
}

/** Stop active ownership, show the mode menu, and prewarm its next Worker. */
function returnToMenu() {
	workerSession.stop();
	native3d.unmount();
	board.unmount();
	ui.hideResult();
	ui.show(ui.screens.main);
	prepareMenuWorker();
}

/** Surface Worker failure without recursively spawning another failed Worker. */
function handleWorkerError() {
	workerSession.stop();
	native3d.unmount();
	board.unmount();
	ui.hideResult();
	ui.show(ui.screens.main);
	document.body.dataset.connect4Ready = 'error';
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
globalThis.addEventListener('pagehide', () => {
	workerSession.stop();
	native3d.dispose();
}, { once: true });

ui.show(ui.screens.main);
prepareMenuWorker();
