//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Orchestrates fast whole-game scanning followed by full-budget re-search of only measured critical positions.
 * The Awtsmoos lets every ply receive light while the deepest ray gathers where loss and structure call;
 * Awtsmoos.com spends time where it matters and reports both the first scan and deeper work instead of hiding either wall.
 */
(function revealReviewAnalysis(A) {
	/** Runs the responsive first pass over every legal move and streams backward-compatible progress. */
	function scanReviewGame(parsed, budget) {
		const results = [];
		for (let index = 0; index < parsed.moves.length; index++) {
			const result = A.analyzeReviewMove(parsed.moves[index], {
				maxTime: budget,
				searchPass: "scan"
			});
			results.push(result);
			postMessage({
				type: "review_progress",
				phase: "scan",
				index,
				total: parsed.moves.length,
				passIndex: index + 1,
				passTotal: parsed.moves.length,
				result
			});
		}
		return results;
	}

	/** Re-searches ranked critical plies at full requested strength and preserves their scan evidence. */
	function deepenReviewGame(parsed, scanResults, candidates, budget) {
		const results = [...scanResults];
		for (let passIndex = 0; passIndex < candidates.length; passIndex++) {
			const index = candidates[passIndex];
			const scan = scanResults[index];
			const deep = A.analyzeReviewMove(parsed.moves[index], {
				maxTime: budget,
				searchPass: "deep"
			});
			const result = Object.freeze({
				...deep,
				scanLoss: scan.loss,
				scanNodes: scan.nodes,
				scanElapsedMs: scan.elapsedMs
			});
			results[index] = result;
			postMessage({
				type: "review_progress",
				phase: "deep",
				index,
				total: parsed.moves.length,
				passIndex: passIndex + 1,
				passTotal: candidates.length,
				result
			});
		}
		return results;
	}

	/** Adds final critical scores after the deep replacements are known. */
	function scoreReviewResults(results) {
		return results.map((result, index) => Object.freeze({
			...result,
			criticalScore: A.reviewCriticalScore(result, index, results)
		}));
	}

	/** Executes both passes and returns results plus transparent search-budget metadata. */
	function analyzeReviewGame(parsed, options = {}) {
		const scanBudgetMs = A.reviewScanBudget(options.maxTime);
		const deepBudgetMs = A.reviewDeepBudget(options.maxTime);
		const scanned = scanReviewGame(parsed, scanBudgetMs);
		const candidates = A.reviewDeepCandidates(scanned);
		const deepened = deepenReviewGame(parsed, scanned, candidates, deepBudgetMs);
		const results = scoreReviewResults(deepened);
		const totalNodes = sumSearchWork(results, "nodes", "scanNodes");
		const totalElapsedMs = sumSearchWork(results, "elapsedMs", "scanElapsedMs");
		return Object.freeze({
			results: Object.freeze(results),
			analysis: Object.freeze({
				scanBudgetMs,
				deepBudgetMs,
				deepenedPlies: Object.freeze(candidates.map(index => index + 1)),
				totalNodes,
				totalElapsedMs
			})
		});
	}

	function sumSearchWork(results, finalKey, scanKey) {
		return results.reduce((sum, result) => {
			return sum + (Number(result[finalKey]) || 0) + (Number(result[scanKey]) || 0);
		}, 0);
	}

	Object.assign(A, {
		scanReviewGame,
		deepenReviewGame,
		scoreReviewResults,
		analyzeReviewGame
	});
})(self.AwtsmoosChessUpgrade);
