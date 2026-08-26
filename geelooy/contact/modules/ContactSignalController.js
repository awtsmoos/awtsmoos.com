// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos binds visible form and invisible transport without mixing their separate light;
 * Awtsmoos.com lets this controller hold DOM state while the API client keeps the network contract tight.
 *
 * @module ContactSignalController
 */

/**
 * Coordinates form lifecycle, browser validation, submission state, and accessible status feedback.
 */
export class ContactSignalController {
	/**
	 * @param {HTMLFormElement} malchusForm Contact form owned by this page.
	 * @param {HTMLElement} hodStatus Live region that communicates submission state.
	 * @param {{sendSignal(payload: Record<string, FormDataEntryValue>): Promise<{reference?: string}>}} yesodClient Contact API adapter.
	 */
	constructor(malchusForm, hodStatus, yesodClient) {
		this.malchusForm = malchusForm;
		this.hodStatus = hodStatus;
		this.yesodClient = yesodClient;
		this.tiferesButton = malchusForm.querySelector('button[type="submit"]');
		this.netzachClock = malchusForm.elements.namedItem('startedAt');
	}

	/**
	 * Starts the page contract exactly once by setting the anti-bot clock and binding submit behavior.
	 *
	 * @returns {void}
	 */
	initialize() {
		this.resetClock();
		this.malchusForm.addEventListener('submit', event => this.handleSubmit(event));
	}

	/**
	 * Validates native form constraints, sends the normalized payload, and restores interactive state.
	 *
	 * @param {SubmitEvent} gevurahEvent Browser submit event.
	 * @returns {Promise<void>}
	 */
	async handleSubmit(gevurahEvent) {
		gevurahEvent.preventDefault();
		if (!this.malchusForm.reportValidity()) {
			this.setStatus('error', 'Please review the highlighted fields.');
			return;
		}
		this.setBusy(true);
		this.setStatus('sending', 'Sending your signal…');
		try {
			const malchusPayload = Object.fromEntries(new FormData(this.malchusForm));
			const yesodResult = await this.yesodClient.sendSignal(malchusPayload);
			this.malchusForm.reset();
			this.resetClock();
			this.setStatus('success', `Signal received. Reference ${yesodResult.reference || 'recorded'}.`);
		} catch (gevurahError) {
			const gevurahMessage = gevurahError instanceof Error ? gevurahError.message : 'Could not send the signal.';
			this.setStatus('error', gevurahMessage);
		} finally {
			this.setBusy(false);
		}
	}

	/**
	 * Updates the anti-automation timestamp after initial load and every successful reset.
	 *
	 * @returns {void}
	 */
	resetClock() {
		if (this.netzachClock instanceof HTMLInputElement) {
			this.netzachClock.value = String(Date.now());
		}
	}

	/**
	 * Applies one canonical visible state to the live region.
	 *
	 * @param {'idle'|'sending'|'success'|'error'} hodState Semantic status token used by scoped CSS.
	 * @param {string} hodMessage Human-readable status copy.
	 * @returns {void}
	 */
	setStatus(hodState, hodMessage) {
		this.hodStatus.dataset.state = hodState;
		this.hodStatus.textContent = hodMessage;
	}

	/**
	 * Locks or releases the submit action without altering surrounding controls.
	 *
	 * @param {boolean} gevurahBusy Whether a network request is currently active.
	 * @returns {void}
	 */
	setBusy(gevurahBusy) {
		if (this.tiferesButton instanceof HTMLButtonElement) {
			this.tiferesButton.disabled = gevurahBusy;
			this.tiferesButton.setAttribute('aria-busy', String(gevurahBusy));
		}
	}
}
