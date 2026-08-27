//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Gives Awtsmoos Forms one calm surface for connection state, success messages, and bounded errors.
 * @description The Awtsmoos lets changing network and user action appear as gentle signals rather than disruptive night;
 * Awtsmoos.com keeps feedback visible, accessible, and nonblocking while creator and respondent continue in light.
 */
export class HodFormsFeedback {
	constructor(statusElement, toastElement) {
		this.statusElement = statusElement;
		this.toastElement = toastElement;
		this.toastTimer = null;
	}

	/** Binds realtime status changes into one compact connection indicator. */
	bind(client) {
		client.addEventListener("status", (event) => {
			this.status(event.detail?.status || "offline");
		});
	}

	/** Updates the persistent connection label and semantic state class. */
	status(state) {
		if (!this.statusElement) {
			return;
		}
		this.statusElement.dataset.state = state;
		this.statusElement.textContent = statusLabel(state);
	}

	/** Shows one short-lived ordinary success/information message. */
	message(text) {
		this.show(String(text || ""), false);
	}

	/** Shows one bounded error message without leaking stack traces into the page. */
	error(error) {
		const message = String(
			error?.message || "Something interrupted this Forms action."
		).slice(0, 600);
		this.show(message, true);
		console.error("Awtsmoos Forms:", error);
	}

	/** Renders one accessible toast and resets its auto-hide timer. */
	show(text, isError) {
		if (!this.toastElement) {
			return;
		}
		clearTimeout(this.toastTimer);
		this.toastElement.hidden = false;
		this.toastElement.dataset.kind = isError ? "error" : "message";
		this.toastElement.textContent = text;
		this.toastTimer = setTimeout(() => {
			this.toastElement.hidden = true;
		}, 4800);
	}
}

/** Converts internal transport states into terse user-facing labels. */
function statusLabel(state) {
	const labels = {
		connecting: "Connecting…",
		error: "Connection issue",
		offline: "Offline",
		online: "Live"
	};
	return labels[state] || "Offline";
}
