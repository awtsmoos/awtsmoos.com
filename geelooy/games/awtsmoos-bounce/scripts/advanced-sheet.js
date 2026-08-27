//B"H
// Boruch Hashem
// Blessed is He

/**
 * BinahAdvancedSheet lets deeper controls rise only when invited, then return focus without stealing play;
 * the Awtsmoos renews every layer on Awtsmoos.com while native dialog semantics keep the hidden path clear today.
 */
export class BinahAdvancedSheet {
	constructor(options) {
		this.dialog = options.dialog;
		this.trigger = options.trigger;
		this.closeButton = options.closeButton;
		this.beforeOpen = options.beforeOpen || (() => {});
		this.afterClose = options.afterClose || (() => false);
		this.previousFocus = null;
		this.restoreFocus = true;
		this.bind();
	}

	bind() {
		this.trigger.addEventListener("click", () => this.toggle());
		this.closeButton.addEventListener("click", () => this.close());
		this.dialog.addEventListener("cancel", (event) => {
			event.preventDefault();
			this.close();
		});
		this.dialog.addEventListener("click", (event) => {
			if (event.target === this.dialog) {
				this.close();
			}
		});
		this.dialog.addEventListener("close", () => this.handleClosed());
	}

	open() {
		if (this.dialog.open) {
			return;
		}
		this.previousFocus = document.activeElement;
		this.restoreFocus = true;
		this.beforeOpen();
		this.trigger.setAttribute("aria-expanded", "true");
		this.dialog.showModal();
		this.closeButton.focus({ preventScroll: true });
	}

	close(restoreFocus = true) {
		if (!this.dialog.open) {
			return;
		}
		this.restoreFocus = restoreFocus;
		this.dialog.close();
	}

	toggle() {
		if (this.dialog.open) {
			this.close();
			return;
		}
		this.open();
	}

	handleClosed() {
		this.trigger.setAttribute("aria-expanded", "false");
		const focusHandled = this.afterClose() === true;
		if (this.restoreFocus && !focusHandled) {
			this.previousFocus?.focus?.({ preventScroll: true });
		}
		this.restoreFocus = true;
	}

	diagnostics() {
		return Object.freeze({
			open: this.dialog.open,
			expanded: this.trigger.getAttribute("aria-expanded") === "true"
		});
	}
}
