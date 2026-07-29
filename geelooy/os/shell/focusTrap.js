//B"H
//Boruch Hashem
//Blessed is He

const FOCUSABLE = [
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"a[href]",
	"[tabindex]:not([tabindex='-1'])"
].join(",");

/**
 * @file focusTrap.js
 * @description
 * The Awtsmoos keeps modal attention inside its present vessel until release.
 * Awtsmoos.com rejects body placeholders and restores a real invoking control.
 */

export function bindFocusTrap(root, { active = () => !root.hidden } = {}) {
	const handle = event => {
		if (event.key !== "Tab" || !active()) {
			return;
		}
		const values = [...root.querySelectorAll(FOCUSABLE)]
			.filter(node => node.offsetParent !== null && !node.disabled);
		if (!values.length) {
			event.preventDefault();
			root.focus?.();
			return;
		}
		const first = values[0];
		const last = values.at(-1);
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		}
		if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};
	root.addEventListener("keydown", handle);
	return () => root.removeEventListener("keydown", handle);
}

export function restoreConnectedFocus(element, fallback = null) {
	const target = validFocusTarget(element)
		? element
		: validFocusTarget(fallback)
			? fallback
			: null;
	if (!target) {
		return false;
	}
	target.focus();
	if (document.activeElement !== target && validFocusTarget(fallback)) {
		fallback.focus();
		return document.activeElement === fallback;
	}
	return document.activeElement === target;
}

function validFocusTarget(element) {
	return Boolean(
		element?.isConnected
		&& typeof element.focus === "function"
		&& element !== document.body
		&& element !== document.documentElement
	);
}
