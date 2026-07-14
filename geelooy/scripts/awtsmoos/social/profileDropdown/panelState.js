// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfilePanelState
 * @description
 * The Awtsmoos lets an identity chamber arrive and depart without leaving an
 * invisible keyboard wall behind on Awtsmoos.com.
 */

const CLOSE_DELAY = 220;
const closeTimers = new WeakMap();
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** Opens a panel before motion begins so its first frame can be painted. */
export function openProfilePanel(panel) {
	clearPanelTimer(panel);
	panel.hidden = false;
	panel.inert = false;
	panel.setAttribute('aria-hidden', 'false');
	panel.dataset.state = 'opening';
	requestAnimationFrame(() => {
		panel.dataset.state = 'open';
	});
}

/** Closes a panel accessibly, then removes it after the exit motion. */
export function closeProfilePanel(panel, immediate = false) {
	clearPanelTimer(panel);
	panel.inert = true;
	panel.setAttribute('aria-hidden', 'true');
	panel.dataset.state = immediate ? 'closed' : 'closing';
	if (immediate) {
		panel.hidden = true;
		return;
	}
	const timer = setTimeout(() => {
		panel.hidden = true;
		panel.dataset.state = 'closed';
		closeTimers.delete(panel);
	}, CLOSE_DELAY);
	closeTimers.set(panel, timer);
}

/** Reports whether the panel currently owns visible interaction. */
export function isProfilePanelOpen(panel) {
	return Boolean(panel && !panel.hidden && panel.getAttribute('aria-hidden') !== 'true');
}

/** Moves focus to the first meaningful action inside a newly opened chamber. */
export function focusFirstProfileControl(panel) {
	requestAnimationFrame(() => {
		panel.querySelector(FOCUSABLE)?.focus();
	});
}

/** Keeps Tab travel inside the active menu without swallowing Escape. */
export function trapProfileFocus(event, panel) {
	if (event.key !== 'Tab' || !isProfilePanelOpen(panel)) return;
	const controls = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(control => !control.hidden);
	if (!controls.length) return;
	const first = controls[0];
	const last = controls.at(-1);
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	}
	if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

function clearPanelTimer(panel) {
	const timer = closeTimers.get(panel);
	if (timer) clearTimeout(timer);
	closeTimers.delete(panel);
}
