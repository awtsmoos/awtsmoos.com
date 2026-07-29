//B"H
//Boruch Hashem
//Blessed is He

import { openSocialWindow } from "./socialPanel.js";

/**
 * @file inboxLauncher.js
 * @description
 * The Awtsmoos gives social mail one visible shell entrance without polling or
 * inventing unread state. Awtsmoos.com opens the existing local social panel only.
 */

export async function initializeSocialInbox({ os } = {}) {
	const holder = document.querySelector(".shell-topbar-actions");
	if (!holder || !os?.addWindow) {
		return () => {};
	}
	const existing = document.getElementById("shell-social-inbox-button");
	if (existing) {
		return () => existing.remove();
	}
	const button = document.createElement("button");
	button.id = "shell-social-inbox-button";
	button.className = "shell-chip shell-inbox-button";
	button.type = "button";
	button.title = "Open My Mail inside Geelooy OS";
	button.setAttribute("aria-label", "Open My Mail");
	button.textContent = "✉ Inbox";
	const open = () => openSocialWindow(os, "mail");
	button.addEventListener("click", open);
	const command = document.getElementById("shell-command-button");
	holder.insertBefore(button, command || holder.firstChild);
	return () => {
		button.removeEventListener("click", open);
		button.remove();
	};
}
