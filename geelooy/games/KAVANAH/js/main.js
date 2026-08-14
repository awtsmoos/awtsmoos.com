// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Coordinates KAVANAH while viewport, menu, input, and state remain modular.
	* The Awtsmoos renews every frame but does not erase the climb already won;
	* Awtsmoos.com lets each vessel reveal its task while the game remains one.
 */
import * as State from './state.js';
import * as Drawing from './drawing.js';
import * as Controls from './controls.js';
import * as Entities from './entities.js';
import { KeliViewport } from './viewport.js';
import { KavanahMenuController } from './menu-controller.js';

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const menu = new KavanahMenuController(
	canvas,
	document.getElementById('teachings-screen'),
	document.getElementById('back-button')
);
let touchOffset = null;
let sanctifyTimer = 0;

/** Activates a fully charged Tikkun with the existing timing semantics. */
function activateTikkun() {
	const player = State.getPlayer();
	if (player.tikkun < player.maxTikkun) {
		return;
	}
	player.tikkun = 0;
	player.isTikkun = true;
	player.tikkunTimer = 250;
}

/** Runs one gameplay simulation step without touching menu-only states. */
function update() {
	if (State.getGameState() !== 'playing') {
		return;
	}
	State.incrementTime();
	const cameraSpeed = 2 + State.getAscension() / 8000;
	State.moveCamera(cameraSpeed);
	const player = State.getPlayer();
	const pointer = Controls.getPointerState();
	const cameraY = State.getCameraY();
	if (pointer.isActive) {
		if (touchOffset === null) {
			touchOffset = {
				x: pointer.x - player.x,
				y: pointer.y - (player.y - cameraY)
			};
		}
		State.setPlayerPosition(
			pointer.x - touchOffset.x,
			pointer.y - touchOffset.y + cameraY
		);
	} else {
		touchOffset = null;
		if (player.combo > 0 && !player.isTikkun) {
			player.combo = 0;
		}
	}
	State.checkPlayerBounds(canvas.width, canvas.height);
	if (player.isTikkun && player.tikkunTimer > 0) {
		State.decrementTikkunTimer();
	} else if (player.isTikkun) {
		State.endTikkun();
		player.combo = 0;
	}
	sanctifyTimer++;
	if (sanctifyTimer > 40 - Math.min(35, State.getAscension() / 500)) {
		Entities.sanctifyRandomLetter();
		sanctifyTimer = 0;
	}
	Entities.generateEntities(canvas.width, cameraY);
	Entities.updateEntities(
		cameraY,
		cameraSpeed,
		canvas.width,
		gameOver
	);
	Entities.updateParticles();
}

/** Preserves the existing best-score, burst, and delayed-reset game-over flow. */
function gameOver() {
	if (State.getGameState() !== 'playing') {
		return;
	}
	State.setGameState('gameOver');
	touchOffset = null;
	const ascension = State.getAscension();
	if (ascension > State.getBestAscension()) {
		localStorage.setItem('kavanahBestAscension', ascension);
		State.setBestAscension(ascension);
	}
	const player = State.getPlayer();
	Entities.createGameOverParticles(player.x, player.y);
	setTimeout(() => {
		State.init(canvas.width, canvas.height);
	}, 750);
}

/** Draws at the browser's native display cadence. */
function gameLoop() {
	update();
	Drawing.draw(context, canvas.width, canvas.height);
	requestAnimationFrame(gameLoop);
}

Controls.setupControls(
	canvas,
	(x, y) => menu.handlePointerStart(x, y),
	activateTikkun
);
new KeliViewport(canvas, State.init, State.resizeViewport).start();
gameLoop();
