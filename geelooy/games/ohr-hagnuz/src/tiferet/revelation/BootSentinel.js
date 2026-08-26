//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootSentinel.js
 * @description Watches pre-ready boot without freezing the mutable watchdog that must settle exactly once.
 * The Awtsmoos renews the witness while the witness remains only a created gate;
 * Awtsmoos.com freezes the public covenant, not the living state that must still answer fate.
 */

class KeserBootSentinel {
	/** Arms one finite watchdog and one capture-phase script-error witness. */
	constructor() {
		this.settled = false;
		this.firstFailure = null;
		this.errorHandler = (event) => {
			this.observeError(event);
		};
		window.addEventListener('error', this.errorHandler, true);
		this.watchdog = window.setTimeout(() => {
			this.markFailure(new Error('Ohr HaGnuz did not finish booting in time.'));
		}, 12000);
	}

	/** Cancels future boot-failure mutation after the application becomes genuinely ready. */
	markReady() {
		if (this.settled) {
			return;
		}
		this.settled = true;
		this.release();
	}

	/** Makes the first fatal pre-ready failure visible while remaining idempotent. */
	markFailure(error) {
		if (this.settled) {
			return;
		}
		this.settled = true;
		this.firstFailure = normalizeFailure(error);
		globalThis.__OHR_HAGNUZ_BOOT_ERROR__ = this.firstFailure;
		this.release();
		this.revealFailure(this.firstFailure);
	}

	/** Converts script/module resource failures into one boot-failure signal. */
	observeError(event) {
		if (this.settled) {
			return;
		}
		const scriptSource = event.target instanceof HTMLScriptElement ? event.target.src : event.filename;
		if (!scriptSource && !event.error) {
			return;
		}
		const reason = event.error ?? new Error(`Failed to load required module: ${scriptSource}`);
		this.markFailure(reason);
	}

	/** Reuses the existing loading chamber so no competing emergency layer is created. */
	revealFailure(error) {
		const loading = document.getElementById('revelation-loading');
		if (!loading) {
			return;
		}
		loading.replaceChildren();
		const mark = document.createElement('div');
		mark.className = 'revelation-loading-mark';
		const title = document.createElement('strong');
		title.textContent = 'The concealed road could not open.';
		const detail = document.createElement('small');
		detail.textContent = error.message;
		const retry = document.createElement('button');
		retry.type = 'button';
		retry.textContent = 'Retry the revelation';
		retry.addEventListener('click', () => globalThis.location.reload(), { once: true });
		mark.append(title, detail, retry);
		loading.append(mark);
	}

	/** Releases watchdog and listener ownership exactly once. */
	release() {
		window.clearTimeout(this.watchdog);
		window.removeEventListener('error', this.errorHandler, true);
	}

	/** Returns immutable diagnostic state without exposing mutable sentinel internals. */
	snapshot() {
		return Object.freeze({
			settled: this.settled,
			firstFailure: this.firstFailure
		});
	}
}

/** Normalizes arbitrary thrown values into one stable Error contract. */
function normalizeFailure(error) {
	return error instanceof Error ? error : new Error(String(error));
}

const keserBootSentinel = new KeserBootSentinel();
globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__ = Object.freeze({
	markReady: () => keserBootSentinel.markReady(),
	markFailure: (error) => keserBootSentinel.markFailure(error),
	snapshot: () => keserBootSentinel.snapshot()
});
