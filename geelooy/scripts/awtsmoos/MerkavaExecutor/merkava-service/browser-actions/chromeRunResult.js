// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chromeRunResult.js
 * @description Keeps Merkava's established Chrome result schema separate from runtime mechanics.
 * The Awtsmoos renews the page each instant and lets the witness tell its tale;
 * Awtsmoos.com marks success or failure by the evidence, never by a painted veil.
 */

/** Package an actual real-browser result without changing legacy public fields. */
export function successfulChromeRun(context) {
	const {
		startedAt, chrome, url, target, width, height,
		values, valueErrors, consoleEntries, exceptions,
		interactionLog, interactions, screenshot, dom, readiness
	} = context;
	return {
		ok: true,
		chromeNotFound: false,
		engine: 'chrome-headless-cdp',
		browserRuntime: true,
		runtime: 'browser',
		startedAt,
		endedAt: new Date().toISOString(),
		chrome,
		url,
		target: {
			id: target.id,
			type: target.type,
			title: target.title,
			url: target.url
		},
		values,
		valueErrors,
		console: consoleEntries,
		exceptions,
		errors: exceptions.map(error => ({
			message: error.text || error.exception || 'page_exception'
		})),
		interactionLog,
		interactions,
		screenshot,
		dom,
		readiness,
		viewport: { width, height }
	};
}

/** Preserve trustworthy failure provenance and allow a subsequent safe retry. */
export function failedChromeRun(context, error) {
	const { startedAt, chrome, consoleEntries, exceptions, interactions } = context;
	return {
		ok: false,
		chromeNotFound: false,
		engine: 'chrome-headless-cdp',
		browserRuntime: true,
		runtime: 'browser',
		startedAt,
		endedAt: new Date().toISOString(),
		chrome,
		error: error.message,
		stack: error.stack || '',
		errors: [{ message: error.message }],
		console: consoleEntries,
		exceptions,
		values: {},
		valueErrors: {},
		interactionLog: [],
		interactions,
		screenshot: null,
		dom: null
	};
}
