// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Coordinates KAVANAH while viewport, menu, input, state, and transitions stay modular.
	* The Awtsmoos renews every frame but does not erase the climb already won;
	* Awtsmoos.com lets each vessel reveal its task while the game remains one.
	*/
import * as State from './state.js';
import * as Drawing from './drawing.js';
import * as Controls from './controls.js';
import * as Entities from './entities.js';
import * as GameActions from './game-actions.js';
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
	updatePlayer(pointer, player, cameraY);
	State.checkPlayerBounds(canvas.width, canvas.height);
	updateTikkun(player);
	updateWorld(cameraY, cameraSpeed);
}

/** Applies pointer motion while preserving the original drag offset semantics. */
function updatePlayer(pointer, player, cameraY) {
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
		return;
	}
	touchOffset = null;
	if (player.combo > 0 && !player.isTikkun) {
		player.combo = 0;
	}
}

/** Advances charged Tikkun duration without changing its original rules. */
function updateTikkun(player) {
	if (player.isTikkun && player.tikkunTimer > 0) {
		State.decrementTikkunTimer();
		return;
	}
	if (player.isTikkun) {
		State.endTikkun();
		player.combo = 0;
	}
}

/** Spawns, updates, and sanctifies the same world entities as before. */
function updateWorld(cameraY, cameraSpeed) {
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
		finishGame
	);
	Entities.updateParticles();
}

/** Clears drag state before delegating the preserved game-over transition. */
function finishGame() {
	touchOffset = null;
	GameActions.finishGame(canvas);
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
	GameActions.activateTikkun
);
new KeliViewport(canvas, State.init, State.resizeViewport).start();
gameLoop();
