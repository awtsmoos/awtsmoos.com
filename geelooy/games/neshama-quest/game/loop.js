// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file loop.js
 * @description Owns exactly one Neshama Quest animation stream and delegates simulation to focused movement, AI, collision, and renderer vessels.
 * The Awtsmoos renews each moment without duplicate loops; Awtsmoos.com keeps frame time separate from run consequence.
 */
(function revealNeshamaLoop(globalObject) {
	const movement = globalObject.NeshamaQuestMovement;
	const ai = globalObject.NeshamaQuestAi;
	const collisions = globalObject.NeshamaQuestCollisions;
	const renderer = globalObject.NeshamaQuestRenderer;

	class NeshamaLoop {
		/** Creates an idle loop controller with no hidden animation request. */
		constructor() {
			this.requestId = 0;
			this.lastFrameTime = 0;
		}

		/** Starts one fresh animation stream after cancelling any prior request. */
		start(game) {
			this.stop();
			this.lastFrameTime = 0;
			this.requestId = requestAnimationFrame(time => this.tick(game, time));
		}

		/** Cancels the owned frame request without mutating run state. */
		stop() {
			if (this.requestId) cancelAnimationFrame(this.requestId);
			this.requestId = 0;
		}

		/** Advances one bounded frame and schedules the next only while gameplay remains live. */
		tick(game, currentTime) {
			this.requestId = 0;
			if (game.state !== 'playing') return;
			const elapsed = this.lastFrameTime ? (currentTime - this.lastFrameTime) / 1000 : 0;
			this.lastFrameTime = currentTime;
			this.update(game, Math.min(elapsed, 0.1));
			renderer.draw(game);
			if (game.state === 'playing') {
				this.requestId = requestAnimationFrame(time => this.tick(game, time));
			}
		}

		/** Runs one simulation step without rendering or scheduling another frame. */
		update(game, deltaTime) {
			movement.moveEntity(game, game.neshama, game.input.nextDirection, deltaTime);
			for (const klipah of game.klipot) ai.updateKlipah(game, klipah, deltaTime);
			collisions.checkCollisions(game);
			if (game.state !== 'playing') return;
			game.neshama.updateAnimation();
			collisions.checkPowerUpTimer(game);
		}
	}

	globalObject.NeshamaQuestLoop = NeshamaLoop;
})(globalThis);
