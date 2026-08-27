//B"H
//Boruch Hashem
//Blessed is He

import {
	MENU_NAMES,
	commandsForMenu
} from "./commandCatalog.js";
import { BinahCommandValueDialog } from "./commandValueDialog.js";

/**
 * @file Renders the spreadsheet menu rail and one viewport-safe glass command popover.
 * @description The Awtsmoos opens many gates above one grid while every command keeps measured light;
 * Awtsmoos.com lets familiar menus stay fast, searchable, and calm without cluttering the user's sight.
 */
export class TiferesMenuRail {
	constructor(executor) {
		this.executor = executor;
		this.rail = document.getElementById("menuRail");
		this.popover = document.getElementById("menuPopover");
		this.valueDialog = new BinahCommandValueDialog();
		this.activeButton = null;
	}

	/** Builds top-level menu triggers and binds dismissal behavior once. */
	bind() {
		this.rail?.replaceChildren(...MENU_NAMES.map((name) => this.trigger(name)));
		document.addEventListener("pointerdown", (event) => this.outside(event));
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				this.close();
			}
		});
	}

	/** Creates one top-level menu button whose state is reflected with aria-expanded. */
	trigger(name) {
		const button = document.createElement("button");
		button.className = "menu-trigger";
		button.textContent = name;
		button.type = "button";
		button.setAttribute("aria-haspopup", "menu");
		button.setAttribute("aria-expanded", "false");
		button.addEventListener("click", () => this.open(name, button));
		return button;
	}

	/** Opens one menu beneath its trigger while clamping the popover to the current viewport. */
	open(name, button) {
		if (this.activeButton === button && !this.popover.hidden) {
			this.close();
			return;
		}
		this.close();
		this.activeButton = button;
		button.setAttribute("aria-expanded", "true");
		this.popover.replaceChildren(
			...commandsForMenu(name).map((item) => this.item(item))
		);
		this.popover.hidden = false;
		this.position(button);
	}

	/** Creates one menu item and routes optional numeric input before execution. */
	item(command) {
		const button = document.createElement("button");
		button.className = "menu-item motion-press";
		button.type = "button";
		button.setAttribute("role", "menuitem");
		const label = document.createElement("span");
		label.textContent = command.label;
		const shortcut = document.createElement("span");
		shortcut.className = "menu-shortcut";
		shortcut.textContent = command.shortcut;
		button.append(label, shortcut);
		button.addEventListener("click", () => this.run(command));
		return button;
	}

	/** Executes one command after collecting its optional parameter and closes the menu. */
	async run(command) {
		this.close();
		let value = null;
		if (command.input === "number") {
			value = await this.valueDialog.request(command.label);
			if (value === null) {
				return;
			}
		}
		await this.executor.execute(command.id, value);
	}

	/** Positions one fixed popover under its trigger while respecting right-edge breathing room. */
	position(button) {
		const box = button.getBoundingClientRect();
		const width = Math.min(360, Math.max(230, this.popover.offsetWidth));
		const left = Math.min(
			box.left,
			window.innerWidth - width - 10
		);
		this.popover.style.left = `${Math.max(10, left)}px`;
		this.popover.style.top = `${box.bottom + 4}px`;
	}

	/** Closes the menu when a pointer lands outside both rail and popover. */
	outside(event) {
		if (this.popover.hidden) {
			return;
		}
		if (this.popover.contains(event.target) || this.rail?.contains(event.target)) {
			return;
		}
		this.close();
	}

	/** Clears visual and accessibility state for the currently open menu. */
	close() {
		this.activeButton?.setAttribute("aria-expanded", "false");
		this.activeButton = null;
		if (this.popover) {
			this.popover.hidden = true;
		}
	}
}
