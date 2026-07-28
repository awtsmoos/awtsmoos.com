// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleProjectIO
 * @description
 * Cinematic starter, autosave, raw movie JSON, and AI envelopes enter through one
 * validated local gateway; Awtsmoos.com keeps server independence and continuity.
 */

import { AI_MOVIE_STARTER_URL } from './NleAiContract.js';
import {
	decodeAiMovieSource,
	loadAiMovieDocument,
	loadAiMovieSchema
} from './NleAiProjectCodec.js';

const STORAGE_KEY = 'awtsmoos.social-nle.project.v1';

export class NleProjectIO {
	constructor(storage = localStorage) {
		this.storage = storage;
	}

	async loadInitial() {
		const parameters = new URL(location.href).searchParams;
		const requested = parameters.get('movieUrl') || AI_MOVIE_STARTER_URL;
		const source = await fetchJson(requested);
		return decodeAiMovieSource(this.restore() || source);
	}

	save(project) {
		this.storage.setItem(STORAGE_KEY, JSON.stringify({ project, savedAt: Date.now(), version: 1 }));
	}

	restore() {
		try {
			const value = JSON.parse(this.storage.getItem(STORAGE_KEY) || 'null');
			return value?.version === 1 ? value.project : null;
		} catch {
			return null;
		}
	}

	async importFile(file) {
		return decodeAiMovieSource(await file.text());
	}

	loadStarter() {
		return loadAiMovieDocument();
	}

	loadSchema() {
		return loadAiMovieSchema();
	}

	download(project) {
		downloadJson(project, `${slug(project.title)}.movie.json`);
	}

	downloadAiEnvelope(envelope, fileName) {
		downloadJson(envelope, fileName);
	}

	downloadMovie(result) {
		downloadBlob(result.blob, result.fileName);
	}
}

async function fetchJson(url) {
	const response = await fetch(url, { credentials: 'same-origin' });
	if (!response.ok) throw new Error(`Movie project failed to load (${response.status}).`);
	return response.json();
}

function downloadJson(value, fileName) {
	const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
	downloadBlob(blob, fileName);
}

function downloadBlob(blob, fileName) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slug(value) {
	return String(value || 'awtsmoos-movie').toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'awtsmoos-movie';
}
