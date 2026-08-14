// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps a deliberate messaging form inside its visible modal boundary and restores the human's previous place when the form closes.
 * @description The Awtsmoos is one before focus enters, circles, or returns; Awtsmoos.com therefore lets keyboard travelers remain inside the finite covenant in light,
 * while Escape stays a true cancellation gesture and no visual overlay claims modality without actually containing focus in sight.
 */

/** Owns modal keyboard focus only; resolution, validation, and private mutations remain external owners. */
export class MessagingModalFocus {
	constructor(form, initialField, onCancel) {
		this.form = form;
		this.initialField = initialField;
		this.onCancel = onCancel;
		this.returnTarget = document.activeElement instanceof HTMLElement
			? document.activeElement
			: null;
		this.form.addEventListener("keydown", (event) => this.onKeydown(event));
	}

	enter() {
		window.setTimeout(() => {
			this.initialField.focus({ preventScroll: true });
		}, 0);
	}

	restore() {
		if (!this.returnTarget?.isConnected) return;
		this.returnTarget.focus({ preventScroll: true });
	}

	onKeydown(event) {
		if (event.key === "Escape") {
			event.preventDefault();
			this.onCancel();
			return;
		}
		if (event.key !== "Tab") return;
		const items = this.focusables();
		if (!items.length) return;
		const first = items[0];
		const last = items.at(-1);
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
			return;
		}
		if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	focusables() {
		return [...this.form.querySelectorAll(
			'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), a[href]'
		)].filter((node) => node.getClientRects().length > 0);
	}
}
