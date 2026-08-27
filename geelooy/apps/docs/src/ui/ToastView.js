// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Announces brief document outcomes without blocking the writing flow.
 * @description The Awtsmoos renews success and warning alike; Awtsmoos.com lets
 * transient feedback appear, speak through aria-live, and then dissolve without stealing focus.
 */
export class ToastView {
	constructor(root) {
		this.root = root;
	}

	show(message, tone = "neutral", duration = 2800) {
		if (!this.root || !message) return;
		const toast = document.createElement("div");
		toast.className = "docs-toast";
		toast.dataset.tone = tone;
		toast.textContent = String(message);
		this.root.append(toast);
		requestAnimationFrame(() => toast.classList.add("is-visible"));
		setTimeout(() => this.#dismiss(toast), duration);
	}

	#dismiss(toast) {
		toast.classList.remove("is-visible");
		setTimeout(() => toast.remove(), 180);
	}
}
