// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioRuntimeParityVerification.js
 * @description Runs an opt-in parity proof inside the served Movie Studio without browser-control dependencies.
 * The Awtsmoos renews every method and gesture as one truth; Awtsmoos.com writes a deterministic
 * DOM receipt only after the real API, rendered controls, invocation path, and responsive layout agree.
 */

const RECEIPT_ID = 'awtsmoos-runtime-parity-receipt';

export async function verifyPublishedMovieStudioParity(environment = globalThis) {
	const api = await waitForMovieApi(environment);
	const methods = api.ui.methods.list({ includeUnsafe: true });
	const actions = api.ui.actions.refresh();
	const diagnostics = actions.find(action => action.id === 'utility-toggle.diagnostics');
	const actionReceipt = diagnostics ? api.ui.actions.invoke(diagnostics.id) : null;
	await delay(350, environment);
	const documentValue = environment.document;
	const panel = documentValue.querySelector('#movie-diagnostics-panel');
	const indirect = await api.ui.methods.invoke('ui.getPreferences', []);
	const direct = api.ui.getPreferences();
	const parity = api.ui.parity();
	const overflow = overflowElements(documentValue, environment.innerWidth);
	const result = Object.freeze({
		actionCardCount: documentValue.querySelectorAll('[data-api-action-card]').length,
		actionCount: actions.length,
		actionReceipt,
		diagnosticsActionId: diagnostics?.id || null,
		diagnosticsOpen: Boolean(panel && !panel.hidden && panel.getAttribute('aria-hidden') !== 'true'),
		directMatchesIndirect: JSON.stringify(direct) === JSON.stringify(indirect.value),
		documentWidth: documentValue.documentElement.scrollWidth,
		innerWidth: environment.innerWidth,
		methodCardCount: documentValue.querySelectorAll('[data-api-method-card]').length,
		methodCount: methods.length,
		noHorizontalOverflow: documentValue.documentElement.scrollWidth <= environment.innerWidth + 1,
		overflow,
		parity
	});
	const ok = Boolean(
		parity.complete
		&& result.diagnosticsOpen
		&& actionReceipt?.ok
		&& result.directMatchesIndirect
		&& result.methodCount === result.methodCardCount
		&& result.actionCount === result.actionCardCount
		&& result.noHorizontalOverflow
	);
	return publishReceipt(documentValue, { ok, result });
}

async function waitForMovieApi(environment) {
	for (let attempt = 0; attempt < 240; attempt += 1) {
		const api = environment.AwtsmoosMovie;
		if (api?.ui?.parity && environment.document?.querySelector?.('.Awtsmoos-movie-studio')) {
			return api;
		}
		await delay(500, environment);
	}
	throw new Error('Movie Studio parity API did not become ready.');
}

function overflowElements(documentValue, viewportWidth) {
	return Array.from(documentValue.querySelectorAll('body *'))
		.map(element => {
			const box = element.getBoundingClientRect();
			return {
				className: typeof element.className === 'string' ? element.className.slice(0, 180) : '',
				id: element.id || '',
				left: Math.round(box.left),
				right: Math.round(box.right),
				scrollWidth: element.scrollWidth,
				tag: element.tagName
			};
		})
		.filter(item => item.right > viewportWidth + 1 || item.left < -1)
		.sort((left, right) => right.right - left.right)
		.slice(0, 40);
}

function publishReceipt(documentValue, receipt) {
	let element = documentValue.getElementById(RECEIPT_ID);
	if (!element) {
		element = documentValue.createElement('script');
		element.id = RECEIPT_ID;
		element.type = 'application/json';
		documentValue.body.append(element);
	}
	element.textContent = JSON.stringify(receipt);
	documentValue.documentElement.dataset.awtsmoosParity = receipt.ok ? 'passed' : 'failed';
	globalThis.AwtsmoosMovieParityReceipt = receipt;
	return receipt;
}

function delay(milliseconds, environment) {
	return new Promise(resolve => environment.setTimeout(resolve, milliseconds));
}
