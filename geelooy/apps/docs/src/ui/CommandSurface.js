// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives menus and command controls one keyboard-aware interaction path.
 * @description The Awtsmoos is one before command surfaces multiply; Awtsmoos.com
 * lets click, arrow key, escape, and semantic command flow through one calm futuristic doorway.
 */
export class CommandSurface {
	constructor(root, onCommand = () => {}) {
		this.root = root;
		this.onCommand = onCommand;
		this.bound = false;
	}

	setExecutor(onCommand) {
		this.onCommand = onCommand;
	}

	bind() {
		if (this.bound) return;
		this.bound = true;
		this.root.addEventListener("click", event => this.#click(event));
		this.root.addEventListener("change", event => this.#change(event));
		document.addEventListener("pointerdown", event => this.#outside(event));
		document.addEventListener("keydown", event => this.#key(event));
	}

	closeMenus({ restoreFocus = false } = {}) {
		const activeTrigger = this.root.querySelector(
			"[data-menu-trigger][aria-expanded=\"true\"]"
		);
		for (const menu of this.root.querySelectorAll("[data-menu].is-open")) {
			menu.classList.remove("is-open");
			menu.setAttribute("aria-hidden", "true");
		}
		for (const trigger of this.root.querySelectorAll("[data-menu-trigger]")) {
			trigger.setAttribute("aria-expanded", "false");
		}
		if (restoreFocus) activeTrigger?.focus({ preventScroll: true });
	}

	#click(event) {
		const trigger = event.target.closest("[data-menu-trigger]");
		if (trigger) {
			event.preventDefault();
			this.#toggleMenu(trigger);
			return;
		}
		const command = event.target.closest("[data-doc-command]");
		if (!command || command.disabled) return;
		event.preventDefault();
		this.closeMenus();
		void this.onCommand(
			command.dataset.docCommand,
			command.dataset.value || ""
		);
	}

	#change(event) {
		const command = event.target.closest("[data-doc-command]");
		if (!command || command.disabled) return;
		void this.onCommand(command.dataset.docCommand, command.value);
	}

	#toggleMenu(trigger) {
		const container = trigger.closest("[data-menu-group]") || this.root;
		const target = container.querySelector(
			`[data-menu="${CSS.escape(trigger.dataset.menuTrigger)}"]`
		);
		const opening = !target?.classList.contains("is-open");
		this.closeMenus();
		if (!target || !opening) return;
		target.classList.add("is-open");
		target.setAttribute("aria-hidden", "false");
		trigger.setAttribute("aria-expanded", "true");
		this.#focusMenuItem(target, 0);
	}

	#outside(event) {
		if (!this.root.contains(event.target)) this.closeMenus();
	}

	#key(event) {
		const menu = this.root.querySelector("[data-menu].is-open");
		if (event.key === "Escape") {
			this.closeMenus({ restoreFocus: true });
			return;
		}
		if (!menu) return;
		if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
		event.preventDefault();
		const items = this.#menuItems(menu);
		if (!items.length) return;
		const current = Math.max(0, items.indexOf(document.activeElement));
		const index = event.key === "Home"
			? 0
			: event.key === "End"
				? items.length - 1
				: event.key === "ArrowDown"
					? (current + 1) % items.length
					: (current - 1 + items.length) % items.length;
		items[index].focus({ preventScroll: true });
	}

	#focusMenuItem(menu, index) {
		this.#menuItems(menu)[index]?.focus({ preventScroll: true });
	}

	#menuItems(menu) {
		return Array.from(menu.querySelectorAll(
			"button:not(:disabled), select:not(:disabled), input:not(:disabled)"
		));
	}
}
