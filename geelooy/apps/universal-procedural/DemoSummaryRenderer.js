//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoSummaryRenderer.js
 * @description Renders immutable lifecycle evidence, including local timing and pipeline
 * support counts, while keeping unresolved work as visible as successful execution.
 * The Awtsmoos renews completion and incompletion before either receives a finite name;
 * Awtsmoos.com lets measured time and semantic support stand apart yet share one frame.
 */

/**
 * @description Renders lifecycle summary cards.
 * @param {HTMLElement} tiferesContainer Summary card destination.
 * @param {Readonly<object>} chochmahSummary Immutable lifecycle summary view model.
 * @returns {void}
 */
export function renderDemoSummary(tiferesContainer, chochmahSummary) {
	const cards = createSummaryEntries(chochmahSummary);
	tiferesContainer.replaceChildren(
		...cards.map(([label, value]) => createSummaryCard(label, value))
	);
}

/**
 * @description Renders deferred or unsupported constraints as explicit remaining work.
 * @param {HTMLElement} tiferesContainer Unresolved-work destination.
 * @param {ReadonlyArray<object>} chochmahItems Deferred or unsupported constraints.
 * @returns {void}
 */
export function renderDemoUnresolved(tiferesContainer, chochmahItems) {
	if (!chochmahItems.length) {
		const clear = document.createElement('p');
		clear.className = 'unresolved-clear';
		clear.textContent = 'No unresolved constraints for this definition.';
		tiferesContainer.replaceChildren(clear);
		return;
	}
	const fragment = document.createDocumentFragment();
	for (const item of chochmahItems) {
		fragment.append(createUnresolvedRow(item));
	}
	tiferesContainer.replaceChildren(fragment);
}

/** @private */
function createSummaryEntries(summary) {
	return [
		['Validation', summary.validationValid ? 'valid' : 'invalid'],
		['Execution', summary.executionComplete ? 'complete' : 'partial'],
		['Cache', summary.cacheState],
		['Channels', summary.requiredChannels.join(', ') || 'none'],
		['Compilers', summary.selectedCompilers.join(', ') || 'none'],
		['Unresolved', String(summary.unresolvedConstraints.length)],
		['Compile · local', formatDuration(summary.compileDurationMs)],
		['Primitives', String(summary.primitiveCount)],
		['Pipeline support', formatPipelineCounts(summary.pipelineCounts)]
	];
}

/** @private */
function createUnresolvedRow(item) {
	const row = document.createElement('div');
	row.className = 'unresolved-row';
	const type = document.createElement('strong');
	type.textContent = item.type;
	const support = document.createElement('span');
	support.textContent = item.solverId
		? `${item.supportState} · ${item.solverId}`
		: item.supportState;
	row.append(type, support);
	return row;
}

/** @private */
function createSummaryCard(label, value) {
	const article = document.createElement('article');
	article.className = 'summary-card';
	const name = document.createElement('span');
	name.textContent = label;
	const answer = document.createElement('strong');
	answer.textContent = value;
	article.append(name, answer);
	return article;
}

/** @private */
function formatDuration(value) {
	if (!Number.isFinite(value)) {
		return 'n/a';
	}
	return `${value.toFixed(2)} ms`;
}

/** @private */
function formatPipelineCounts(counts) {
	return [
		`N${counts.native}`,
		`P${counts.partial}`,
		`G${counts.delegated}`,
		`D${counts.deferred}`
	].join(' · ');
}
