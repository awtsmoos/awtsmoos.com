//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusBootManifest.js
 * @description Owns the user-visible boot lifecycle for Sefira Clash without owning gameplay.
 * The Awtsmoos renews hidden causes until they descend into a visible truthful sign;
 * Awtsmoos.com lets Malchus reveal loading, readiness, or failure without entangling the fighting design.
 */

const KELI_STATE = Object.freeze({
	LOADING: 'loading',
	READY: 'ready',
	FAILED: 'failed'
});

export class MalchusBootManifest {
	/** Creates one local boot-status vessel. */
	constructor(documentObject = document) {
		this.documentObject = documentObject;
		this.state = KELI_STATE.LOADING;
		this.errorCode = null;
		this.errorMessage = null;
		this.root = this.createRoot();
	}

	/** Reveals intentional loading while the required gameplay graph evaluates. */
	revealLoading() {
		this.state = KELI_STATE.LOADING;
		this.root.hidden = false;
		this.root.dataset.bootState = this.state;
		this.setCopy('Awakening the arena…', 'Gathering the gameplay vessels into one living frame.');
	}

	/** Hides the boot vessel once gameplay owns the screen. */
	revealReady() {
		this.state = KELI_STATE.READY;
		this.errorCode = null;
		this.errorMessage = null;
		this.root.dataset.bootState = this.state;
		this.root.hidden = true;
	}

	/** Manifests required-boot failure instead of leaving a blank canvas. */
	revealFatal(error, errorCode = 'SEFIRA_BOOT_FAILED') {
		const normalizedError = normalizeBootError(error);
		this.state = KELI_STATE.FAILED;
		this.errorCode = errorCode;
		this.errorMessage = normalizedError.message;
		this.root.hidden = false;
		this.root.dataset.bootState = this.state;
		this.root.dataset.errorCode = errorCode;
		this.setCopy('The arena could not awaken.', `${errorCode} · ${normalizedError.message}`);
	}

	/** Returns an immutable diagnostic contract for tests and support tooling. */
	snapshot() {
		return Object.freeze({
			state: this.state,
			errorCode: this.errorCode,
			errorMessage: this.errorMessage
		});
	}

	/** Builds one locally scoped manifestation above the game shell. */
	createRoot() {
		const root = this.documentObject.createElement('section');
		root.className = 'sefiraBootManifest';
		root.setAttribute('role', 'status');
		root.setAttribute('aria-live', 'polite');
		root.innerHTML = [
			'<div class="sefiraBootManifest__card">',
			'<span class="sefiraBootManifest__kicker">Sefira Clash // Boot Covenant</span>',
			'<h1 class="sefiraBootManifest__title"></h1>',
			'<p class="sefiraBootManifest__copy"></p>',
			'<button class="sefiraBootManifest__retry" type="button">Retry arena</button>',
			'</div>'
		].join('');
		root.querySelector('.sefiraBootManifest__retry')?.addEventListener('click', () => {
			globalThis.location?.reload?.();
		});
		this.documentObject.body.append(root);
		return root;
	}

	/** Updates human-readable copy without leaking DOM ownership to the entry. */
	setCopy(title, copy) {
		this.root.querySelector('.sefiraBootManifest__title').textContent = title;
		this.root.querySelector('.sefiraBootManifest__copy').textContent = copy;
	}
}

/** Converts arbitrary thrown values into a stable diagnostic shape. */
function normalizeBootError(error) {
	if (error instanceof Error) return error;
	return new Error(typeof error === 'string' ? error : 'Unknown gameplay bootstrap failure');
}
