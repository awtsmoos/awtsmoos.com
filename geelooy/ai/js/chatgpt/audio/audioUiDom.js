//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos creates state and visible consequence as one renewed truth while
 * this module merely carries that truth into DOM vessels. Awtsmoos.com gains a
 * single place for labels, feedback, busy semantics, and recoverable actions.
 */
export function applyAudioView(root, view, taskActive = false) {
	root.dataset.audioState = view.state;
	root.dataset.audioTone = view.tone;
	root.setAttribute("aria-busy", String(Boolean(view.busy || taskActive)));
	setText(root, ".audio-state-chip", view.chip);
	setText(root, "[data-audio-action='play']", view.primaryLabel);
	setText(root, "[data-audio-action='download']", view.downloadLabel);
	if (view.message) {
		setAudioFeedback(root, view.message, view.tone);
	}
	setRetry(root, view.retryAction);
}

export function setAudioFeedback(root, message, tone = "idle") {
	const node = statusNode(root);
	if (!node) {
		return;
	}
	node.textContent = String(message || "");
	node.dataset.tone = tone;
}

export function setAudioPlayerAvailable(root, available = true) {
	root.classList.toggle("has-audio-player", Boolean(available));
	root.dataset.audioPlayer = available ? "ready" : "hidden";
}

export function setAudioBusy(root, busy, options = {}) {
	root.classList.toggle("is-audio-busy", Boolean(busy));
	const hasTask = Boolean(root.dataset.audioTaskKind);
	root.setAttribute("aria-busy", String(Boolean(busy || hasTask)));
	for (const action of ["play", "download"]) {
		const button = root.querySelector(`[data-audio-action='${action}']`);
		if (!button) {
			continue;
		}
		const allowed = action === "play"
			? options.allowPlay
			: options.allowDownload;
		button.disabled = Boolean(busy && !allowed);
	}
}

export function retryActionFor(root) {
	return root.querySelector("[data-audio-action='retry']")?.dataset.retryAction || "";
}

export function statusNode(root) {
	return root.querySelector(".audio-status");
}

function setRetry(root, action) {
	const button = root.querySelector("[data-audio-action='retry']");
	if (!button) {
		return;
	}
	button.hidden = !action;
	button.dataset.retryAction = action || "";
}

function setText(root, selector, text) {
	const node = root.querySelector(selector);
	if (node) {
		node.textContent = text;
	}
}
