//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keyboard-focus covenant for modal Explorer sheets and dialogs.
 * @description
 * The Awtsmoos lets attention enter one temporary vessel without becoming lost;
 * Awtsmoos.com keeps Tab inside the visible dialog, offers a reliable first focus,
 * and returns attention to the invoking control when the vessel closes in rhyme.
 */
const FOCUSABLE = [
	"button:not([disabled])",
	"input:not([disabled])",
	"textarea:not([disabled])",
	"select:not([disabled])",
	"a[href]",
	"[tabindex]:not([tabindex='-1'])"
].join(",");

/**
 * Creates one focus manager around an already-mounted modal dialog.
 *
 * @param {HTMLElement} dialog Modal dialog element.
 * @returns {{focus:Function,dispose:Function}} Focus lifecycle controller.
 */
export function createDialogFocus(dialog) {
	const previous = document.activeElement;
	let active = true;
	dialog.tabIndex = dialog.tabIndex >= 0 ? dialog.tabIndex : -1;

	const onKey = event => {
		if (!active || event.key !== "Tab") {
			return;
		}
		const items = focusable(dialog);
		if (!items.length) {
			event.preventDefault();
			dialog.focus();
			return;
		}
		const first = items[0];
		const last = items[items.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
			return;
		}
		if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	document.addEventListener("keydown", onKey);
	return {
		focus(element) {
			setTimeout(() => {
				if (active) {
					(element || focusable(dialog)[0] || dialog).focus?.();
				}
			}, 0);
		},
		dispose(options = {}) {
			if (!active) {
				return;
			}
			active = false;
			document.removeEventListener("keydown", onKey);
			if (options.restore !== false && previous?.isConnected) {
				previous.focus?.();
			}
		}
	};
}

function focusable(dialog) {
	return [...dialog.querySelectorAll(FOCUSABLE)].filter(element => {
		return element.getAttribute("aria-hidden") !== "true";
	});
}
