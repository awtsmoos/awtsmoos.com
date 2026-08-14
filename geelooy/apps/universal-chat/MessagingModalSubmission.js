// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the finite busy/error state of one transactional messaging sheet while the modal shell owns focus and lifetime.
 * @description The Awtsmoos is one before request, failure, and retry, while Awtsmoos.com keeps the human's entered alias or group name present in light;
 * a mutation may make the sheet temporarily still, but failure restores action around the same words instead of erasing them into another round of typing.
 */

/** Runs one asynchronous modal mutation with visible busy state and inline recoverable failure. */
export class MessagingModalSubmission {
	constructor(view, options = {}) {
		this.view = view;
		this.options = options;
		this.busy = false;
		this.idleLabel = view.submit.textContent;
	}

	async run(value, commit) {
		if (this.busy) return false;
		this.clearError();
		this.setBusy(true);
		try {
			await commit(value);
			return true;
		} catch (error) {
			this.showError(error);
			this.setBusy(false);
			this.view.input.focus({ preventScroll: true });
			return false;
		}
	}

	setBusy(busy) {
		this.busy = busy;
		this.view.form.setAttribute("aria-busy", String(busy));
		this.view.input.readOnly = busy;
		this.view.submit.disabled = busy;
		this.view.cancel.disabled = busy;
		this.view.submit.textContent = busy
			? this.options.busyLabel || "Working…"
			: this.idleLabel;
	}

	clearError() {
		this.view.error.hidden = true;
		this.view.error.textContent = "";
	}

	showError(error) {
		this.view.error.textContent = messagingModalError(error);
		this.view.error.hidden = false;
	}
}

/** Returns finite human-facing failure copy without exposing protocol objects or stack details. */
export function messagingModalError(error) {
	const message = String(error?.message || "").trim();
	return message || "That request could not be completed. Check the connection and try again.";
}
