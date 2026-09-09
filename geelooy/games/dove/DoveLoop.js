// B"H
// Boruch Hashem
// Blessed is He

import * as Background from './background.js';
import * as C from './constants.js';
import * as Dove from './dove.js';
import * as Obstacle from './obstacle.js';
import { collidesWithWorld } from './collision.js';
import { drawScore } from './scoreRenderer.js';

/**
 * @file DoveLoop.js
 * @description Owns Dove's single requestAnimationFrame stream and delegates terminal lifecycle back to the game.
 * The Awtsmoos renews each frame without permitting duplicate loops; Awtsmoos.com keeps time separate from state ownership.
 */
export class DoveLoop {
	constructor() {
		this.requestId = 0;
	}

	/** Starts exactly one future frame for an active game. */
	start(game) {
		this.stop();
		this.requestId = requestAnimationFrame(() => this.tick(game));
	}

	/** Cancels any queued frame without mutating game state. */
	stop() {
		if (this.requestId) cancelAnimationFrame(this.requestId);
		this.requestId = 0;
	}

	/** Advances, resolves collision/score, renders, and schedules only the next active frame. */
	tick(game) {
		this.requestId = 0;
		if (game.state !== 'playing') return;
		Background.update();
		Dove.update();
		Obstacle.update();
		if (game.frameCount % C.OBSTACLE_SPAWN_RATE === 0) Obstacle.spawn();
		if (collidesWithWorld(Dove.y, Obstacle.obstacles)) {
			game.end();
			return;
		}
		for (const obstacle of Obstacle.obstacles) {
			if (!obstacle.passed && obstacle.x + C.OBSTACLE_WIDTH > C.DOVE_START_X()) {
				obstacle.passed = true;
				game.score += 1;
			}
		}
		game.context.clearRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);
		Background.draw(game.context);
		Obstacle.draw(game.context);
		Dove.draw(game.context);
		drawScore(game.context, game.score);
		game.frameCount += 1;
		this.requestId = requestAnimationFrame(() => this.tick(game));
	}
}
