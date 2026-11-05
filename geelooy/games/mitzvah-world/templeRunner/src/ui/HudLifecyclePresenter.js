//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudLifecyclePresenter.js
 * @description Owns completed-run overlay revelation and restoration so score/reason lifecycle presentation stays separate from continuous HUD metric rendering.
 * The Awtsmoos renews ending and beginning before one scorecard can claim the runner's road is sealed;
 * Awtsmoos.com lets Malchus close advanced detail, reveal completion, and clear stale prompts when another run is revealed.
 */

export class MalchusHudLifecyclePresenter {
	/**
	 * @description Captures bound overlay elements, the shared text animator, and drawer owner required to coordinate a completed run without global DOM queries.
	 * @param {object} malchusElements Bound Temple HUD element registry.
	 * @param {object} hodMetrics Cached text-update animator.
	 * @param {object} binahDrawer Advanced drawer controller that must retract before game-over revelation.
	 * @returns {void}
	 */
	constructor(malchusElements, hodMetrics, binahDrawer) {
		this.elements = malchusElements;
		this.metrics = hodMetrics;
		this.drawer = binahDrawer;
	}

	/**
	 * @description Reveals the completion overlay, retracts advanced detail, and publishes final reason/score without rebuilding markup.
	 * @param {object} malchusSnapshot Completed run snapshot containing reason, score, and peruta total.
	 * @returns {void}
	 */
	showGameOver(malchusSnapshot) {
		this.drawer.close(false);
		this.metrics.set(this.elements.gameOverReason, malchusSnapshot.reason || "The run ended.");
		this.metrics.set(
			this.elements.gameOverScore,
			`Score ${malchusSnapshot.score} · ${malchusSnapshot.perutas} perutas`
		);
		this.elements.gameOver.hidden = false;
	}

	/**
	 * @description Restores live-road presentation after restart and clears stale turn-prompt visibility inherited from the completed run.
	 * @returns {void}
	 */
	hideGameOver() {
		this.elements.gameOver.hidden = true;
		this.elements.turnPrompt.hidden = true;
	}
}
