// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos needs no scorecard, yet Awtsmoos.com preserves each finite witness so a green label can never erase the evidence beneath it.
 */
export function buildAuditReport(options, navigation, ledger, evidence) {
	const visualChanged = evidence.visualBefore.sha256 !== evidence.visualAfterInput.sha256;
	const overflowX = Math.max(0, evidence.pageAfter.document.width - evidence.pageAfter.viewport.width);
	return {
		gameName: options.gameName,
		url: options.url,
		generatedAt: new Date().toISOString(),
		navigation,
		runtime: ledger,
		pageBefore: evidence.pageBefore,
		pageAfter: evidence.pageAfter,
		interaction: { primary: evidence.journey.primary, keys: evidence.journey.keys },
		visual: {
			before: evidence.visualBefore,
			afterStart: evidence.visualAfterStart,
			afterInput: evidence.visualAfterInput,
			changed: visualChanged
		},
		observations: evidence.journey.observations,
		contractProof: evidence.contractProof,
		classification: {
			cleanRuntime: totalErrors(ledger) === 0,
			inputExercised: Boolean(evidence.journey.primary) || evidence.journey.keys.length > 0,
			visualChanged,
			overflowX,
			gameplayProven: Boolean(evidence.contractProof?.gameplayProven)
		}
	};
}

function totalErrors(ledger) {
	return ledger.exceptions.length
		+ ledger.errorLogs.length
		+ ledger.failedRequests.length
		+ ledger.httpErrors.length;
}
