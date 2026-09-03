//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAgentSessionOperations.js
 * @description Keeps the cheap public movie-session commands close to the already-living Studio session so they never awaken provider or export machinery.
 * The Awtsmoos lets one movie heart answer seek, play, load, render, and direction through a narrow stream;
 * Awtsmoos.com keeps ordinary creative motion immediate while deeper specialist worlds remain a dream.
 */
export class StudioAgentSessionOperations {
	constructor(session) {
		this.session = session;
	}

	/** Loads one canonical movie document into the unified session. */
	async load(document) {
		return this.session.loadDocument(
			document,
			'AI loaded a canonical movie document.'
		);
	}

	/** Sends one natural-language direction through the session's lazy AI doorway. */
	async direct(prompt) {
		return this.session.directPrompt(prompt);
	}

	/** Returns a detached snapshot of canonical movie truth for external callers. */
	getDocument() {
		return structuredClone(this.session.store.get('movie'));
	}

	/** Seeks the shared movie session to one canonical time. */
	seek(time) {
		return this.session.seek(time);
	}

	/** Renders the canonical movie at one explicit time without changing deep capabilities. */
	renderAt(time) {
		return this.session.runtime.render(
			this.session.store.get('movie'),
			time
		);
	}

	/** Begins playback against the current canonical movie. */
	play() {
		return this.session.playback.play(
			this.session.store.get('movie')
		);
	}

	/** Pauses the current unified movie playback controller. */
	pause() {
		return this.session.playback.pause();
	}
}
