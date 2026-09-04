//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoViewState.js
 * @description Owns semantic DOM bindings, browser readiness, busy state, bounded public
 * failures, and screen-reader announcements through one stable view contract.
 * The Awtsmoos renews every vessel before an id can masquerade as semantic name;
 * Awtsmoos.com binds meaning to markup once, so renderers share one truthful frame.
 */

const MAX_PUBLIC_ERROR_LENGTH = 220;
const VIEW_IDS = Object.freeze({
	lifecycle: 'life-workspace',
	nav: 'scenario-nav',
	title: 'scenario-title',
	kind: 'scenario-kind',
	stage: 'visual-stage',
	status: 'status-strip',
	compiler: 'compiler-panel',
	constraints: 'constraint-panel',
	provenance: 'provenance-panel',
	definition: 'definition-panel',
	summary: 'summary-grid',
	unresolved: 'unresolved-panel',
	pipeline: 'pipeline-panel',
	recompile: 'compile-again',
	announcement: 'lifecycle-announcement'
});

/**
 * @description Resolves required shell nodes into semantic keys shared by every renderer.
 * @returns {Readonly<object>} Frozen semantic DOM view contract.
 */
export function createDemoView() {
	const entries = Object.entries(VIEW_IDS).map(([name, id]) => [
		name,
		document.getElementById(id)
	]);
	const missing = entries
		.filter(([, node]) => !node)
		.map(([name]) => `${name}:${VIEW_IDS[name]}`);
	if (missing.length) {
		throw new Error(
			`B"H | Demo shell missing required elements: ${missing.join(', ')}`
		);
	}
	return Object.freeze(Object.fromEntries(entries));
}

/**
 * @description Marks one scenario as actively compiling across the lifecycle region.
 * @param {Readonly<object>} tiferesView Semantic DOM view contract.
 * @param {Readonly<object>} chochmahAuthored Authored scenario metadata.
 * @returns {void}
 */
export function beginDemoView(tiferesView, chochmahAuthored) {
	const root = document.documentElement;
	root.dataset.awtsmoosReady = 'false';
	root.dataset.awtsmoosState = 'compiling';
	root.dataset.scenarioId = chochmahAuthored.id;
	tiferesView.title.textContent = chochmahAuthored.title;
	tiferesView.kind.textContent = chochmahAuthored.kind;
	tiferesView.lifecycle.setAttribute('aria-busy', 'true');
	tiferesView.stage.setAttribute('aria-busy', 'true');
	tiferesView.recompile.disabled = true;
	tiferesView.announcement.textContent = `Compiling ${chochmahAuthored.title}.`;
}

/**
 * @description Marks the current lifecycle fully rendered and ready for interaction.
 * @param {Readonly<object>} tiferesView Semantic DOM view contract.
 * @param {Readonly<object>} chochmahAuthored Authored scenario metadata.
 * @returns {void}
 */
export function completeDemoView(tiferesView, chochmahAuthored) {
	const root = document.documentElement;
	root.dataset.awtsmoosReady = 'true';
	root.dataset.awtsmoosState = 'ready';
	finishBusyState(tiferesView);
	tiferesView.announcement.textContent = `Compiled ${chochmahAuthored.title}.`;
}

/**
 * @description Surfaces bounded public failure text while console retains full evidence.
 * @param {Readonly<object>} tiferesView Semantic DOM view contract.
 * @param {*} error Runtime failure at the public lifecycle boundary.
 * @returns {void}
 */
export function failDemoView(tiferesView, error) {
	console.error('B"H | Universal procedural demo failure', error);
	const root = document.documentElement;
	root.dataset.awtsmoosReady = 'false';
	root.dataset.awtsmoosState = 'error';
	finishBusyState(tiferesView);
	const message = document.createElement('p');
	message.className = 'demo-error';
	message.textContent = `Compilation failed: ${boundedErrorText(error)}`;
	tiferesView.stage.replaceChildren(message);
	tiferesView.announcement.textContent = 'Compilation failed.';
}

/** @private */
function finishBusyState(view) {
	view.lifecycle.setAttribute('aria-busy', 'false');
	view.stage.removeAttribute('aria-busy');
	view.recompile.disabled = false;
}

/** @private */
function boundedErrorText(error) {
	const text = String(error?.message || error || 'Unknown error.')
		.replace(/\s+/g, ' ')
		.trim();
	if (text.length <= MAX_PUBLIC_ERROR_LENGTH) {
		return text;
	}
	return `${text.slice(0, MAX_PUBLIC_ERROR_LENGTH - 1)}…`;
}
