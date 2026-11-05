// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreferences.js
 * @description Applies, persists, imports, exports, and resets serializable studio preferences.
 * The Awtsmoos renews arrangement without altering the movie; Awtsmoos.com lets pane,
 * density, theme, overlay, and zoom choices survive safely outside project history.
 */

import {
	parseCanonicalMovieJson,
	stringifyCanonicalMovieJson
} from './MovieCanonicalJson.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import {
	DEFAULT_MOVIE_STUDIO_PREFERENCES,
	normalizeMovieStudioPreferences,
	validateMovieStudioOverlayName
} from './MovieStudioPreferenceState.js';
import {
	loadMovieStudioPreferences,
	resolveMovieStudioPreferenceStorage,
	saveMovieStudioPreferences
} from './MovieStudioPreferenceStorage.js';

export class MovieStudioPreferences {
	constructor(root, events, storage = resolveMovieStudioPreferenceStorage()) {
		this.root = root;
		this.events = events;
		this.storage = storage;
		this.value = loadMovieStudioPreferences(storage);
		this.apply();
	}
	get() {
		return createMovieProjectSnapshot(this.value);
	}
	set(source, options = {}) {
		this.value = normalizeMovieStudioPreferences({
			...this.value,
			...source,
			overlays: {
				...this.value.overlays,
				...(source?.overlays || {})
			}
		});
		this.apply();
		if (options.persist !== false) this.save();
		if (options.emit !== false) this.emit();
		return this.get();
	}
	setOverlay(name, enabled, options = {}) {
		const overlay = validateMovieStudioOverlayName(name);
		return this.set({ overlays: { [overlay]: Boolean(enabled) } }, options);
	}
	reset(options = {}) {
		this.value = normalizeMovieStudioPreferences(
			DEFAULT_MOVIE_STUDIO_PREFERENCES
		);
		this.apply();
		if (options.persist !== false) this.save();
		if (options.emit !== false) this.emit();
		return this.get();
	}
	export() {
		return stringifyCanonicalMovieJson(this.value);
	}
	import(source, options = {}) {
		const value = typeof source === 'string'
			? parseCanonicalMovieJson(source, 'movie studio preferences')
			: source;
		return this.set(normalizeMovieStudioPreferences(value), options);
	}
	apply() {
		const { root, value } = this;
		root.dataset.density = value.density;
		root.dataset.theme = value.theme;
		root.dataset.previewZoom = value.previewZoom;
		root.style.setProperty('--movie-inspector-width', `${value.inspectorWidth}px`);
		root.style.setProperty('--movie-timeline-height', `${value.timelineHeight}px`);
		root.style.setProperty('--movie-track-header-width', `${value.trackHeaderWidth}px`);
		for (const [name, enabled] of Object.entries(value.overlays)) {
			root.classList.toggle(`show-${overlayClass(name)}`, enabled);
		}
	}
	save() {
		return saveMovieStudioPreferences(this.storage, this.value);
	}
	emit() {
		this.events?.emit('ui:preferences', { preferences: this.value });
	}
}

function overlayClass(name) {
	return String(name).replace(
		/[A-Z]/g,
		letter => `-${letter.toLowerCase()}`
	);
}
