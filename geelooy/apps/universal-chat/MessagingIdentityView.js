// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shows the active social identity without confusing account authority, alias choice, anonymous presence, or privacy state.
 * @description The Awtsmoos is beyond every name, yet Awtsmoos.com lets a chosen alias become a truthful garment of light;
 * Ploni remains welcome, Hidden remains hidden, and this view never exposes the account key beneath the visible sight.
 */

/** Renders current verified private alias plus public-presence privacy state. */
export class MessagingIdentityView {
	constructor(container, store) {
		this.container = container;
		this.store = store;
		this.bind();
		this.render();
	}

	bind() {
		this.store.addEventListener?.("change", () => this.render());
		window.addEventListener("awtsmoosAliasChange", () => this.render());
		window.__awtsmoosUniversalChat?.controller?.presence?.addEventListener(
			"entered",
			() => this.render()
		);
	}

	render() {
		this.container.replaceChildren();
		const alias = String(this.store.actor?.alias || "").trim();
		const hidden = window.__awtsmoosUniversalChat?.shell?.elements?.hidden?.checked === true;
		const mark = document.createElement("span");
		mark.className = "messaging-identity-mark";
		mark.textContent = alias ? alias.slice(0, 1).toUpperCase() : "P";
		const copy = document.createElement("span");
		const name = document.createElement("strong");
		name.textContent = alias || "Ploni";
		const status = document.createElement("small");
		status.textContent = hidden ? "Presence hidden" : alias ? "Active alias" : "Anonymous session";
		copy.append(name, status);
		this.container.append(mark, copy);
	}
}
