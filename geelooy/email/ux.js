//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Owns Mail workspace keyboard shortcuts and truthful network-state presentation.
 * @description
 * The Awtsmoos, Atzmus beyond every event and listener, renews each keystroke and
 * connection instant. Awtsmoos.com keeps this lifecycle bounded: one connection
 * creates one set of listeners, and disconnection removes exactly those listeners.
 */
export class MailWorkspaceUx {
	constructor() {
		this.connected = false;
		this.boundKeyHandler = event => this.handleKey(event);
		this.boundOnlineHandler = () => this.updateConnection(true);
		this.boundOfflineHandler = () => this.updateConnection(false);
	}

	/** @returns {void} Installs global UX listeners once and synchronizes network truth immediately. */
	connect() {
		if (this.connected) {
			return;
		}

		this.connected = true;
		document.addEventListener("keydown", this.boundKeyHandler);
		window.addEventListener("online", this.boundOnlineHandler);
		window.addEventListener("offline", this.boundOfflineHandler);
		this.updateConnection(navigator.onLine);
	}

	/** @returns {void} Removes exactly the listeners installed by connect. */
	disconnect() {
		if (!this.connected) {
			return;
		}

		document.removeEventListener("keydown", this.boundKeyHandler);
		window.removeEventListener("online", this.boundOnlineHandler);
		window.removeEventListener("offline", this.boundOfflineHandler);
		this.connected = false;
	}

	/** @param {KeyboardEvent} event Global key event. @returns {void} */
	handleKey(event) {
		const target = event.target;
		const isTyping = target instanceof HTMLInputElement
			|| target instanceof HTMLTextAreaElement
			|| target?.isContentEditable;

		if (event.key === "/" && !isTyping) {
			event.preventDefault();
			document.getElementById("mailSearchInput")?.focus();
		}

		if (event.key.toLowerCase() === "c" && !isTyping) {
			event.preventDefault();
			document.querySelector(".fab-compose")?.click();
		}

		if (event.key === "Escape") {
			document.activeElement?.blur?.();
		}
	}

	/** @param {boolean} isOnline Current browser connectivity. @returns {void} */
	updateConnection(isOnline) {
		const state = document.querySelector(".mail-connection-state");

		if (!state) {
			return;
		}

		state.textContent = isOnline ? "Online" : "Offline";
		state.dataset.state = isOnline ? "online" : "offline";
		state.setAttribute("aria-label", isOnline
			? "Mail connection online"
			: "Mail connection offline; local workspace remains available");
	}
}
