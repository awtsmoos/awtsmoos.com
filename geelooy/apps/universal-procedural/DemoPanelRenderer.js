//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoPanelRenderer.js
 * @description Renders compiler, constraint, provenance, cache, and canonical-definition
 * evidence with safe text nodes so diagnostics remain inspectable and injection-resistant.
 * The Awtsmoos renews evidence before explanation takes finite form;
 * Awtsmoos.com lets public receipts speak plainly without disguising presentation as norm.
 */

/**
 * @description Renders the detailed non-visual evidence for one lifecycle execution.
 * @param {object} chochmahView DOM panel references.
 * @param {Readonly<object>} tiferesDefinition Canonical semantic definition.
 * @param {Readonly<object>} binahPlan Universal plan.
 * @param {Readonly<object>} malchusResult Universal compile result.
 * @returns {void}
 */
export function renderDemoEvidence(
	chochmahView,
	tiferesDefinition,
	binahPlan,
	malchusResult
) {
	renderRows(chochmahView.compiler, [
		['complete', String(binahPlan.compilerChain.complete)],
		['selected', selectedCompilerIds(binahPlan)],
		['channels', binahPlan.request.required.join(', ') || 'none'],
		['quality', binahPlan.request.quality],
		['budget', JSON.stringify(binahPlan.request.budget)]
	]);
	renderRows(
		chochmahView.constraints,
		binahPlan.constraints.items.map((item) => [
			item.constraintType,
			formatConstraintSupport(item)
		])
	);
	renderRows(chochmahView.provenance, [
		['hash', malchusResult.identity.contentHash],
		['seed', String(malchusResult.provenance.seed)],
		['executed', malchusResult.execution.executedCompilerIds.join(', ') || 'none'],
		['cache', resolveCacheState(malchusResult.cache)],
		['constraint result', malchusResult.constraints.satisfied ? 'satisfied' : 'deferred / mixed']
	]);
	chochmahView.definition.textContent = JSON.stringify(tiferesDefinition, null, 2);
}

/**
 * @description Renders compact execution pills for at-a-glance browser assertions.
 * @param {HTMLElement} tiferesContainer Status-strip element.
 * @param {Readonly<object>} chochmahResult Universal compile result.
 * @returns {void}
 */
export function renderDemoStatus(tiferesContainer, chochmahResult) {
	const states = [
		['execution', chochmahResult.execution.executionComplete ? 'complete' : 'partial'],
		['cache', resolveCacheState(chochmahResult.cache)],
		['constraints', String(chochmahResult.constraints.plan.activeCount)],
		['deferred', String(chochmahResult.constraints.plan.unresolvedCount)]
	];
	tiferesContainer.replaceChildren(
		...states.map(([label, value]) => createStatusPill(label, value))
	);
}

/** @private */
function renderRows(container, rows) {
	container.replaceChildren();
	for (const [label, value] of rows) {
		const row = document.createElement('div');
		row.className = 'evidence-row';
		const name = document.createElement('span');
		name.textContent = label;
		const answer = document.createElement('strong');
		answer.textContent = String(value);
		row.append(name, answer);
		container.append(row);
	}
}

/** @private */
function createStatusPill(label, value) {
	const pill = document.createElement('span');
	pill.className = 'status-pill';
	pill.append(`${label} `);
	const strong = document.createElement('strong');
	strong.textContent = value;
	pill.append(strong);
	return pill;
}

/** @private */
function selectedCompilerIds(plan) {
	return plan.compilerChain.accepted.map((item) => item.compilerId).join(', ') || 'none';
}

/** @private */
function formatConstraintSupport(item) {
	return item.solverId ? `${item.supportState} · ${item.solverId}` : item.supportState;
}

/** @private */
function resolveCacheState(cache) {
	if (cache.hit === true) return 'hit';
	if (cache.hit === false) return 'miss';
	return 'bypass';
}
