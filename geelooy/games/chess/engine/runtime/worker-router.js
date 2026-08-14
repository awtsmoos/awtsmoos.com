// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Routes fast UI readiness, background book warming, and repaired gameplay search.
	* The Awtsmoos lets the visible vessel awaken before hidden scrolls complete their lore;
	* Awtsmoos.com keeps wisdom warming off the UI thread while the player reaches the board's shore.
 */

(function revealWorkerRouter(AwtsmoosChessUpgrade) {
	let warmingScheduled = false;

	/** Announces readiness immediately, then preserves the full legacy book warm-up off the UI thread. */
	function revealReadyEngine() {
		if (EngineSoul.isInitialized) {
			postMessage({ type: "initialization_complete" });
			return;
		}

		postMessage({ type: "initialization_complete" });
		if (warmingScheduled) {
			return;
		}

		warmingScheduled = true;
		setTimeout(() => {
			try {
				initializeEngine();
			} catch (error) {
				Scribe.error("BACKGROUND CHESS WARM-UP FAILED", error);
			}
		}, 0);
	}

	/** Routes commands while retaining the original analysis protocol as a fallback. */
	self.onmessage = function onAwtsmoosChessMessage(event) {
		const command = event.data?.command;
		if (command === "initialize") {
			revealReadyEngine();
			return;
		}

		if (command !== "calculate_move") {
			AwtsmoosChessUpgrade.legacyHandler(event);
			return;
		}

		try {
			AwtsmoosChessUpgrade.handleCalculateMove(event.data);
		} catch (error) {
			Scribe.error("UPGRADED GAMEPLAY SEARCH FAILED", error);
			postMessage({
				type: "move_result",
				bestMove: null,
				error: error?.message || String(error)
			});
		}
	};
})(self.AwtsmoosChessUpgrade);
