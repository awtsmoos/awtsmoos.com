// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiUi.js
 * @description Exposes preferences plus complete method, UI-action, and parity discovery.
 * The Awtsmoos renews arrangement and action without changing story; Awtsmoos.com lets human
 * controls and programmatic callers share one visible registry while canonical history remains sovereign.
 */

import {
	describeMovieStudioApiMethod,
	invokeMovieStudioApiMethod,
	listMovieStudioApiMethods
} from './MovieStudioApiMethodInventory.js';
import { createMovieStudioApiParityReport } from './MovieStudioApiParity.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioUiDomain(session) {
	return Object.freeze({
		actions: actionDomain(session),
		export: () => session.preferences.export(),
		getPreferences: () => session.preferences.get(),
		import: (source, options = {}) => operation(
			session,
			'ui.import',
			options,
			() => session.preferences.import(source, options)
		),
		methods: methodDomain(session),
		parity: () => createMovieStudioApiParityReport(
			session.publicApi,
			session.uiActionRegistry,
			session.apiExplorerController?.renderedPaths || []
		),
		resetPreferences: (options = {}) => operation(
			session,
			'ui.resetPreferences',
			options,
			() => session.preferences.reset(options)
		),
		setDensity: (density, options = {}) => setPreferences(session, { density }, 'ui.setDensity', options),
		setOverlay: (name, enabled, options = {}) => operation(
			session,
			'ui.setOverlay',
			options,
			() => session.preferences.setOverlay(name, enabled, options)
		),
		setPreferences: (value, options = {}) => setPreferences(session, value, 'ui.setPreferences', options),
		setPreviewZoom: (previewZoom, options = {}) => setPreferences(session, { previewZoom }, 'ui.setPreviewZoom', options),
		setTheme: (theme, options = {}) => setPreferences(session, { theme }, 'ui.setTheme', options)
	});
}

function actionDomain(session) {
	return Object.freeze({
		describe: id => session.uiActionRegistry?.describe(id) || null,
		invoke: (id, payload) => session.uiActionRegistry?.invoke(id, payload)
			|| { ok: false, error: { code: 'MOVIE_UI_REGISTRY_UNAVAILABLE', message: 'UI registry is unavailable.' } },
		list: () => session.uiActionRegistry?.list() || Object.freeze([]),
		refresh: () => session.uiActionRegistry?.refresh() || Object.freeze([])
	});
}

function methodDomain(session) {
	return Object.freeze({
		describe: (path, options) => describeMovieStudioApiMethod(session.publicApi, path, options),
		invoke: (path, args, options) => invokeMovieStudioApiMethod(session.publicApi, path, args, options),
		list: options => listMovieStudioApiMethods(session.publicApi, options)
	});
}

function setPreferences(session, value, name, options) {
	return operation(session, name, options, () => session.preferences.set(value, options));
}

function operation(session, name, options, handler) {
	return runMovieStudioApiOperation(session, name, options, handler);
}
