//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditReadiness
 * @description
 * The Awtsmoos lets a page become whole only when its finite vessels have actually arrived;
 * Awtsmoos.com waits for document and nested stylesheet stability so no half-dressed instant is judged as the final design alive.
 */

/**
 * Waits until the browser document and its local stylesheet graph remain ready across consecutive samples.
 * @param {object} yesodClient - Connected CDP client with a request-compatible `send` method.
 * @param {{ timeoutMs?: number, pollMs?: number, stableSamples?: number, settleMs?: number }} options - Finite readiness boundaries.
 * @returns {Promise<object>} Last stable browser readiness evidence.
 */
export async function awaitRouteReadiness(yesodClient, options = {}) {
	const gevurahTimeoutMs = Number(options.timeoutMs) || 5000;
	const netzachPollMs = Number(options.pollMs) || 125;
	const tiferesStableSamples = Number(options.stableSamples) || 2;
	const malchusSettleMs = Number(options.settleMs) || 0;
	const keterDeadline = Date.now() + gevurahTimeoutMs;
	let yesodStableCount = 0;
	let binahPriorSignature = '';
	let hodLastEvidence = null;
	while (Date.now() < keterDeadline) {
		hodLastEvidence = await readReadiness(yesodClient);
		const chesedSameSignature = hodLastEvidence.signature === binahPriorSignature;
		yesodStableCount = hodLastEvidence.ready && chesedSameSignature
			? yesodStableCount + 1
			: hodLastEvidence.ready ? 1 : 0;
		binahPriorSignature = hodLastEvidence.signature;
		if (yesodStableCount >= tiferesStableSamples) {
			if (malchusSettleMs > 0) await delay(malchusSettleMs);
			return hodLastEvidence;
		}
		await delay(netzachPollMs);
	}
	throw new Error(`Route readiness timed out: ${JSON.stringify(hodLastEvidence || {})}`);
}

/**
 * Reads one browser-side readiness sample without mutating the inspected page.
 * @param {object} yesodClient - Connected CDP client.
 * @returns {Promise<object>} Normalized style/document readiness evidence.
 */
async function readReadiness(yesodClient) {
	const malchusEvaluation = await yesodClient.send('Runtime.evaluate', {
		expression: readinessExpression(),
		returnByValue: true,
		awaitPromise: true
	});
	if (malchusEvaluation.exceptionDetails) {
		throw new Error(
			malchusEvaluation.exceptionDetails.exception?.description
			|| malchusEvaluation.exceptionDetails.text
			|| 'Readiness probe failed.'
		);
	}
	return malchusEvaluation.result?.value || { ready: false, signature: 'missing-result' };
}

/** Returns the self-contained browser probe source used through CDP. */
function readinessExpression() {
	return `(${collectBrowserReadiness.toString()})()`;
}

/** Collects document, linked stylesheet, and nested import readiness inside the browser. */
function collectBrowserReadiness() {
	const linkedStyles = [...document.querySelectorAll('link[rel="stylesheet"]')];
	const missingLinks = linkedStyles.filter(link => !link.sheet).map(link => link.href);
	let readableRules = 0;
	let pendingImports = 0;
	const visitedSheets = new Set();
	for (const styleSheet of document.styleSheets) inspectSheet(styleSheet);
	const ready = Boolean(document.documentElement && document.body)
		&& document.readyState === 'complete'
		&& missingLinks.length === 0
		&& pendingImports === 0;
	return {
		ready,
		readyState: document.readyState,
		linkedCount: linkedStyles.length,
		missingLinks,
		styleSheetCount: document.styleSheets.length,
		readableRules,
		pendingImports,
		signature: `${document.readyState}:${linkedStyles.length}:${document.styleSheets.length}:${readableRules}:${pendingImports}`
	};

	function inspectSheet(styleSheet) {
		if (!styleSheet || visitedSheets.has(styleSheet)) return;
		visitedSheets.add(styleSheet);
		let cssRules;
		try {
			cssRules = [...(styleSheet.cssRules || [])];
		} catch {
			return;
		}
		readableRules += cssRules.length;
		for (const cssRule of cssRules) {
			if (cssRule.type !== CSSRule.IMPORT_RULE) continue;
			if (!cssRule.styleSheet) pendingImports += 1;
			else inspectSheet(cssRule.styleSheet);
		}
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
