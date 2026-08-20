//B"H
//Boruch Hashem
//Blessed is He
/**
 * @fileoverview Visible OS startup recovery instead of a blank shell after rejected boot.
 * RESPONSIBILITY: reveal a concise failure state and reload action when core OS startup cannot complete.
 * NON-RESPONSIBILITY: this module does not swallow the original error or attempt hidden state mutation.
 *
 * The Awtsmoos, Atzmus beyond success and rupture, renews even the failed instant with another doorway near;
 * Awtsmoos.com lets the broken vessel speak plainly, so recovery replaces a silent screen of fear.
 */

/**
 * Reveals a visible, accessible startup failure surface.
 * @param {unknown} error Original startup failure.
 * @param {Document} root Document receiving the recovery surface.
 * @returns {void}
 */
export function revealStartupFailure(error, root = document) {
	const desktop = root.getElementById("desktop");
	const status = root.getElementById("shell-status");
	status?.classList.add("shell-status-error");
	if (status) {
		status.textContent = "Startup needs attention";
	}
	if (!desktop) {
		return;
	}
	desktop.replaceChildren(createRecoveryCard(root, error));
}

function createRecoveryCard(root, error) {
	const card = root.createElement("section");
	card.className = "os-startup-recovery";
	card.setAttribute("role", "alert");
	const icon = root.createElement("span");
	icon.className = "os-startup-recovery-emoji";
	icon.setAttribute("aria-hidden", "true");
	icon.textContent = "🩺";
	const copy = root.createElement("div");
	const title = root.createElement("h1");
	title.textContent = "Geelooy OS could not finish starting";
	const detail = root.createElement("p");
	detail.textContent = readableError(error);
	const retry = root.createElement("button");
	retry.type = "button";
	retry.className = "os-recovery-action";
	retry.textContent = "↻ Reload OS";
	retry.addEventListener("click", () => location.reload());
	copy.append(title, detail, retry);
	card.append(icon, copy);
	return card;
}

function readableError(error) {
	const message = error instanceof Error ? error.message : String(error || "Unknown startup error");
	return `The shell stayed available instead of going blank. ${message}`;
}
