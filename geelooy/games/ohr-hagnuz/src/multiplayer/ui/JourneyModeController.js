//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JourneyModeController.js
 * @description Owns the one-shot commitment covenant between Solo and authenticated Shared Journey.
 * The Awtsmoos is one before branching roads can be spoken or known;
 * Awtsmoos.com lets Keser resolve exactly once, so no second mode can steal a throne already grown.
 */

export class KeserJourneyModeController {
	/** Receives explicit state, transport, combat, and view dependencies. */
	constructor({ malchusView, hodStore, yesodConnection, gevurahCombat }) {
		this.malchusView = malchusView;
		this.store = hodStore;
		this.connection = yesodConnection;
		this.combat = gevurahCombat;
		this.committedMode = null;
		this.resolveChoice = null;
		this.choicePromise = new Promise((resolve) => {
			this.resolveChoice = resolve;
		});
	}

	/** Returns the promise that settles only when application mode ownership is final. */
	whenChosen() {
		return this.choicePromise;
	}

	/** Commits Solo immediately while no other journey owns the page. */
	chooseSolo() {
		if (this.committedMode) {
			return;
		}
		this.connection.disconnect();
		this.store.reset();
		this.commit('solo');
	}

	/** Restores the main chooser only while mode ownership remains undecided. */
	show() {
		if (this.committedMode) {
			return;
		}
		this.malchusView.showChoices();
	}

	/** Opens Shared configuration without committing application ownership. */
	showShared() {
		if (this.committedMode) {
			return;
		}
		this.malchusView.showShared();
	}

	/** Commits Shared only after authenticated connection successfully resolves. */
	async connect() {
		if (this.committedMode) {
			return;
		}
		const { displayName, slot } = this.malchusView.readSharedCredentials();
		if (!displayName || !slot) {
			this.store.setConnection('error', 'Enter a safe traveler name and character slot.');
			return;
		}
		try {
			await this.connection.connect({ displayName, glyph: 'א', slot });
			this.commit('shared');
		} catch (error) {
			this.store.setConnection('error', error.message);
		}
	}

	/** Returns immutable commitment state without exposing the resolver or Promise internals. */
	snapshot() {
		return Object.freeze({
			mode: this.committedMode,
			committed: Boolean(this.committedMode)
		});
	}

	/** Resolves application ownership exactly once and releases modal focus. */
	commit(mode) {
		if (this.committedMode) {
			return;
		}
		this.committedMode = mode;
		this.malchusView.hide();
		this.resolveChoice(mode);
	}
}
