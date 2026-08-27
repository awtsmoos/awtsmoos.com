//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos shapes plain DOM into quiet, semantic vessels. Awtsmoos.com
 * keeps element creation here so menu behavior can remain a short clear river.
 */
export function createMessageActionElements(sequence) {
	const root = document.createElement("div");
	root.className = "message-action-root";
	const trigger = document.createElement("button");
	trigger.type = "button";
	trigger.className = "message-action-trigger";
	trigger.textContent = "•••";
	trigger.setAttribute("aria-label", "Message actions");
	trigger.setAttribute("aria-haspopup", "menu");
	trigger.setAttribute("aria-expanded", "false");
	const menu = document.createElement("div");
	menu.className = "message-action-menu";
	menu.id = `message-action-menu-${sequence}`;
	menu.setAttribute("role", "menu");
	menu.hidden = true;
	trigger.setAttribute("aria-controls", menu.id);
	const status = document.createElement("span");
	status.className = "message-action-status";
	status.setAttribute("aria-live", "polite");
	root.append(trigger, menu, status);
	return { root, trigger, menu, status };
}

export function createMessageActionButton(item, onActivate) {
	const button = document.createElement("button");
	button.type = "button";
	button.setAttribute("role", "menuitem");
	button.dataset.messageAction = item.id;
	const icon = document.createElement("span");
	icon.setAttribute("aria-hidden", "true");
	icon.textContent = item.icon;
	const label = document.createElement("span");
	label.textContent = item.label;
	button.append(icon, label);
	button.addEventListener("click", () => onActivate(button, item));
	return button;
}
