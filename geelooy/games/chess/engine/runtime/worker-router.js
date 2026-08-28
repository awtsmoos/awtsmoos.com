// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Routes readiness, live search, fast PGN parsing, deep review, and legacy commands through one proven worker.
 * The Awtsmoos lets each request find its vessel while Awtsmoos.com keeps gameplay and study in tune.
 */
(function revealWorkerRouter(A) {
	let warmingScheduled = false;

/** Announces readiness immediately, then warms the real opening book away from first paint. */
	function revealReadyEngine() {
		if (EngineSoul.isInitialized) {
			postMessage({ type: "initialization_complete" });
			return;
		}
		postMessage({ type: "initialization_complete" });
		if (warmingScheduled) return;
		warmingScheduled = true;
		setTimeout(() => {
			try {
				initializeEngine();
			} catch (error) {
				Scribe.error("BACKGROUND CHESS WARM-UP FAILED", error);
			}
		}, 0);
	}

	/** Emits command-specific failure without corrupting another protocol. */
	function revealCommandError(command, error) {
		const message = error?.message || String(error);
		if (command === "review_pgn") {
			postMessage({ type: "review_error", message });
			return;
		}
		if (command === "studio_parse_pgn") {
			postMessage({ type: "studio_pgn_error", message });
			return;
		}
		postMessage({ type: "move_result", bestMove: null, error: message });
	}
	/** Routes upgraded commands and preserves legacy commands as a compatibility fallback. */
	self.onmessage = function onAwtsmoosChessMessage(event) {
		const command = event.data?.command;
		if (command === "initialize") {
			revealReadyEngine();
			return;
		}
		try {
			if (command === "calculate_move") return A.handleCalculateMove(event.data);
			if (command === "studio_parse_pgn") return A.handleParseStudioPgn(event.data);
			if (command === "review_pgn") return A.handleReviewPgn(event.data);
			A.legacyHandler(event);
		} catch (error) {
			Scribe.error(`UPGRADED ${command || "UNKNOWN"} COMMAND FAILED`, error);
			revealCommandError(command, error);
		}
	};
})(self.AwtsmoosChessUpgrade);
