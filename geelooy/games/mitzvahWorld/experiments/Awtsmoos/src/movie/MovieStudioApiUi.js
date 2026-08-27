// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiUi.js
 * @description Exposes serializable preferences, overlays, density, theme, zoom, import, and reset.
 * The Awtsmoos renews arrangement without changing story; Awtsmoos.com gives agents
 * revision-neutral interface control whose bounded values persist outside canonical movie history.
 */

import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioUiDomain(session) {
	return Object.freeze({
		export: () => session.preferences.export(),
		getPreferences: () => session.preferences.get(),
		import: (source, options = {}) => runMovieStudioApiOperation(
			session,
			'ui.import',
			options,
			() => session.preferences.import(source, options)
		),
		resetPreferences: (options = {}) => runMovieStudioApiOperation(
			session,
			'ui.resetPreferences',
			options,
			() => session.preferences.reset(options)
		),
		setDensity: (density, options = {}) => setPreferences(
			session,
			{ density },
			'ui.setDensity',
			options
		),
		setOverlay: (name, enabled, options = {}) => runMovieStudioApiOperation(
			session,
			'ui.setOverlay',
			options,
			() => session.preferences.setOverlay(name, enabled, options)
		),
		setPreferences: (value, options = {}) => setPreferences(
			session,
			value,
			'ui.setPreferences',
			options
		),
		setPreviewZoom: (previewZoom, options = {}) => setPreferences(
			session,
			{ previewZoom },
			'ui.setPreviewZoom',
			options
		),
		setTheme: (theme, options = {}) => setPreferences(
			session,
			{ theme },
			'ui.setTheme',
			options
		)
	});
}

function setPreferences(session, value, operation, options) {
	return runMovieStudioApiOperation(
		session,
		operation,
		options,
		() => session.preferences.set(value, options)
	);
}
