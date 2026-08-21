// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders semantic menu definitions into anchored, accessible Awtsmoos Docs popovers.
 * @description The Awtsmoos is beyond menu and hierarchy; Awtsmoos.com lets a deep
 * command universe appear from small anchors while labels, shortcuts, icons, and permissions remain explicit.
 */
export class MenuRenderer {
	constructor(root) {
		this.root = root;
	}

	render(menus = []) {
		this.root.replaceChildren(...menus.map(menu => this.#menuGroup(menu)));
	}

	#menuGroup(menu) {
		const group = document.createElement("div");
		group.className = "menu-group";
		group.dataset.menuGroup = menu.id;
		const trigger = document.createElement("button");
		trigger.className = "menu-trigger";
		trigger.type = "button";
		trigger.dataset.menuTrigger = menu.id;
		trigger.setAttribute("aria-haspopup", "menu");
		trigger.setAttribute("aria-expanded", "false");
		trigger.textContent = menu.label;
		const panel = document.createElement("div");
		panel.className = "docs-menu";
		panel.dataset.menu = menu.id;
		panel.setAttribute("role", "menu");
		panel.setAttribute("aria-label", `${menu.label} menu`);
		panel.setAttribute("aria-hidden", "true");
		panel.append(...menu.items.map(item => this.#item(item)));
		group.append(trigger, panel);
		return group;
	}

	#item(item) {
		if (item.type === "separator") {
			const separator = document.createElement("div");
			separator.className = "menu-separator";
			separator.setAttribute("role", "separator");
			return separator;
		}
		if (item.type === "select") return this.#select(item);
		return this.#command(item);
	}

	#command(item) {
		const button = document.createElement("button");
		button.className = "menu-item";
		button.type = "button";
		button.dataset.docCommand = item.command;
		if (item.value) button.dataset.value = item.value;
		if (item.icon) button.dataset.icon = item.icon;
		if (item.requiresEdit) button.dataset.requiresEdit = "";
		button.setAttribute("role", "menuitem");
		button.append(
			labelSpan(item.label),
			shortcutSpan(item.shortcut)
		);
		return button;
	}

	#select(item) {
		const row = document.createElement("label");
		row.className = "menu-select-row";
		if (item.icon) row.dataset.icon = item.icon;
		const label = labelSpan(item.label);
		const select = document.createElement("select");
		select.dataset.docCommand = item.command;
		if (item.requiresEdit) select.dataset.requiresEdit = "";
		select.setAttribute("aria-label", item.label);
		for (const [value, text] of item.options || []) {
			const option = document.createElement("option");
			option.value = value;
			option.textContent = text;
			select.append(option);
		}
		row.append(label, select);
		return row;
	}
}

function labelSpan(value) {
	const span = document.createElement("span");
	span.className = "menu-item-label";
	span.textContent = value;
	return span;
}

function shortcutSpan(value) {
	const span = document.createElement("span");
	span.className = "menu-shortcut";
	span.textContent = value || "";
	return span;
}
