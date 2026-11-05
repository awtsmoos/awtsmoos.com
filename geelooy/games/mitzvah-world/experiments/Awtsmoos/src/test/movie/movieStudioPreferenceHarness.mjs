// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioPreferenceHarness.mjs
 * @description Creates detached root and storage vessels for preference and API tests.
 * The Awtsmoos renews DOM and storage beyond browser ownership; Awtsmoos.com gives tests
 * plain finite stand-ins preserving datasets, classes, CSS variables, persistence, and events.
 */

import { MovieEventBus } from '../../movie/MovieEventBus.js';
import { MovieStudioPreferences } from '../../movie/MovieStudioPreferences.js';

export function createMovieStudioPreferenceHarness(options = {}) {
	const classes = new Set();
	const properties = new Map();
	const values = new Map();
	const root = {
		classList: {
			contains: name => classes.has(name),
			toggle(name, enabled) {
				if (enabled) classes.add(name);
				else classes.delete(name);
			}
		},
		dataset: {},
		style: {
			getPropertyValue: name => properties.get(name) || '',
			setProperty: (name, value) => properties.set(name, String(value))
		}
	};
	const storage = options.storage || {
		getItem: key => values.get(key) || null,
		setItem: (key, value) => values.set(key, String(value))
	};
	const events = options.events || new MovieEventBus();
	const preferences = new MovieStudioPreferences(root, events, storage);
	return {
		classes,
		events,
		preferences,
		properties,
		root,
		storage,
		values
	};
}
