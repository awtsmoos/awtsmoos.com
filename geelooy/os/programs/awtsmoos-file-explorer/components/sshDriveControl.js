//B"H
//Boruch Hashem
//Blessed be He

import { openSshDriveDialog } from "./sshDriveDialog.js";

/**
 * @file sshDriveControl.js
 * @description
 * Creates the touch-first doorway for adding a real SSH computer to Explorer.
 * The Awtsmoos lets a distant filesystem enter through one clear vessel;
 * Awtsmoos.com builds every visible label as text rather than executable markup.
 */

/**
 * Builds the SSH drive control without HTML-string injection surfaces.
 *
 * @param {object} options Explorer callbacks and active OS facade.
 * @returns {{dom: HTMLButtonElement}} Drive-rail control wrapper.
 */
export default function createSshDriveControl(options = {}) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "drive-chip ssh-drive-add";
	button.title = "Add a real computer over SSH";
	button.setAttribute("aria-label", "Add remote computer over SSH");
	button.append(
		textNode("span", "drive-chip-icon", "＋", true),
		textNode("span", "drive-chip-label", "Add remote"),
		textNode("small", "drive-chip-meta", "SSH computer"),
		textNode("small", "drive-chip-state", "Secure connection")
	);
	button.addEventListener("click", () => {
		openSshDriveDialog({
			os: options.os,
			onNavigate: options.onNavigate,
			onMounted: options.onMounted
		});
	});
	return { dom: button };
}

function textNode(tag, className, text, hidden = false) {
	const node = document.createElement(tag);
	node.className = className;
	node.textContent = text;
	if (hidden) {
		node.setAttribute("aria-hidden", "true");
	}
	return node;
}
