// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives menus and command controls one event path instead of scattered listeners.
 * @description The Awtsmoos is one before command surfaces multiply; Awtsmoos.com
 * lets menu, toolbar, and selection actions flow through one semantic doorway in rhyme.
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
		document.addEventListener("click", event => this.#outside(event));
		document.addEventListener("keydown", event => this.#key(event));
	}

	closeMenus() {
		for (const menu of this.root.querySelectorAll("[data-menu].is-open")) {
			menu.classList.remove("is-open");
		}
		for (const trigger of this.root.querySelectorAll("[data-menu-trigger]")) {
			trigger.setAttribute("aria-expanded", "false");
		}
	}

	#click(event) {
		const trigger = event.target.closest("[data-menu-trigger]");
		if (trigger) {
			event.preventDefault();
			this.#toggleMenu(trigger);
			return;
		}
		const command = event.target.closest("[data-doc-command]");
		if (!command) return;
		event.preventDefault();
		this.closeMenus();
		this.onCommand(command.dataset.docCommand, command.dataset.value || "");
	}

	#change(event) {
		const command = event.target.closest("[data-doc-command]");
		if (!command) return;
		this.onCommand(command.dataset.docCommand, command.value);
	}

	#toggleMenu(trigger) {
		const target = this.root.querySelector(`[data-menu="${CSS.escape(trigger.dataset.menuTrigger)}"]`);
		const opening = !target?.classList.contains("is-open");
		this.closeMenus();
		if (!target || !opening) return;
		target.classList.add("is-open");
		trigger.setAttribute("aria-expanded", "true");
		target.querySelector("button, select, input")?.focus({ preventScroll: true });
	}

	#outside(event) {
		if (!this.root.contains(event.target)) this.closeMenus();
	}

	#key(event) {
		if (event.key === "Escape") this.closeMenus();
	}
}
