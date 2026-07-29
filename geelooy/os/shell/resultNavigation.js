//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file resultNavigation.js
 * @description
 * The Awtsmoos lets keyboard focus walk living result buttons after every redraw.
 * Awtsmoos.com keeps selection connected, visible, and activation deterministic.
 */

export function bindResultNavigation({ input, root, selector, onEscape }) {
	let activeId = null;
	const buttons = () => [...root.querySelectorAll(selector)]
		.filter(button => !button.disabled && button.offsetParent !== null);
	const select = (index, focus = true) => {
		const values = buttons();
		if (!values.length) {
			activeId = null;
			return null;
		}
		const bounded = Math.max(0, Math.min(index, values.length - 1));
		const selected = values[bounded];
		activeId = selected.dataset.actionId || selected.id || null;
		for (const button of values) {
			const active = button === selected;
			button.tabIndex = active ? 0 : -1;
			button.dataset.active = String(active);
			if (button.getAttribute("role") === "option") {
				button.setAttribute("aria-selected", String(active));
			}
		}
		selected.scrollIntoView({ block: "nearest" });
		if (focus) {
			selected.focus();
		}
		return selected;
	};
	const refresh = () => {
		const values = buttons();
		const index = values.findIndex(button => (
			button.dataset.actionId || button.id
		) === activeId);
		for (const button of values) {
			button.tabIndex = -1;
			button.dataset.active = "false";
		}
		if (index > -1) {
			select(index, false);
		}
	};
	const handle = event => {
		const values = buttons();
		const current = values.indexOf(document.activeElement);
		if (event.key === "Escape") {
			event.preventDefault();
			onEscape?.();
			return;
		}
		if (!values.length) {
			return;
		}
		if (event.key === "Enter" && document.activeElement === input) {
			event.preventDefault();
			values[0].click();
			return;
		}
		if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
			return;
		}
		event.preventDefault();
		if (event.key === "Home") return void select(0);
		if (event.key === "End") return void select(values.length - 1);
		if (event.key === "ArrowDown") return void select(current < 0 ? 0 : current + 1);
		if (current <= 0) {
			activeId = null;
			input.focus();
			return;
		}
		select(current - 1);
	};
	input.addEventListener("keydown", handle);
	root.addEventListener("keydown", handle);
	return {
		refresh,
		dispose() {
			input.removeEventListener("keydown", handle);
			root.removeEventListener("keydown", handle);
		}
	};
}
