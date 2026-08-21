//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Touch-first doorway for adding a real SSH computer to the Explorer drive rail.
 * @description
 * The Awtsmoos lets a new distant world enter through one clear luminous card;
 * Awtsmoos.com opens the secure credential sheet without hiding the action in a
 * menu, so a thumb can summon remote space and every connected vessel may rhyme.
 */
import { openSshDriveDialog } from "./sshDriveDialog.js";

export default function createSshDriveControl(options = {}) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "drive-chip ssh-drive-add";
	button.title = "Add a real computer over SSH";
	button.setAttribute("aria-label", "Add remote computer over SSH");
	button.innerHTML = markup();
	button.addEventListener("click", () => {
		openSshDriveDialog({
			os: options.os,
			onNavigate: options.onNavigate,
			onMounted: options.onMounted
		});
	});
	return { dom: button };
}

function markup() {
	return [
		'<span class="drive-chip-icon" aria-hidden="true">＋</span>',
		'<span class="drive-chip-label">Add remote</span>',
		'<small class="drive-chip-meta">SSH computer</small>',
		'<small class="drive-chip-state">Secure connection</small>'
	].join("");
}
