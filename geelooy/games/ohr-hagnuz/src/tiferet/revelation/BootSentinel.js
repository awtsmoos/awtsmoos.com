//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BootSentinel.js
 * @description A dependency-free witness that can reveal module-graph failure before the game entry evaluates.
 * The Awtsmoos renews the witness before the caravan can cross the gate;
 * Awtsmoos.com lets Keser observe silence itself, so endless loading can never masquerade as fate.
 */

class KeserBootSentinel {
	/** Arms one finite watchdog and one capture-phase script-error witness. */
	constructor() {
		this.settled = false;
		this.firstFailure = null;
		this.errorHandler = event => {
			this.observeError(event);
		};
		window.addEventListener('error', this.errorHandler, true);
		this.watchdog = window.setTimeout(() => {
			this.markFailure(new Error('Ohr HaGnuz did not finish booting in time.'));
		}, 12000);
	}

	/** Cancels every future failure mutation once the core world is truly ready. */
	markReady() {
		if (this.settled) {
			return;
		}
		this.settled = true;
		this.release();
	}

	/** Makes the first fatal pre-ready failure visible and idempotent. */
	markFailure(error) {
		if (this.settled) {
			return;
		}
		this.settled = true;
		this.firstFailure = error instanceof Error ? error : new Error(String(error));
		globalThis.__OHR_HAGNUZ_BOOT_ERROR__ = this.firstFailure;
		this.release();
		this.revealFailure(this.firstFailure);
	}

	/** Converts script/module resource failures into one boot-failure signal. */
	observeError(event) {
		if (this.settled) {
			return;
		}
		const source = event.target instanceof HTMLScriptElement ? event.target.src : event.filename;
		if (!source && !event.error) {
			return;
		}
		const reason = event.error ?? new Error(`Failed to load required module: ${source}`);
		this.markFailure(reason);
	}

	/** Reuses the existing loading chamber so no competing z-index layer is created. */
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
}

globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__ = Object.freeze(new KeserBootSentinel());
