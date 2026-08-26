//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Accessible secure-connection sheet for adding or reconnecting a real SSH drive.
 * @description
 * The Awtsmoos lets encrypted distance become one focused doorway; Awtsmoos.com
 * separates remembered profile identity from temporary credential light, keeping
 * the security promise visible while status speech remains accessible in rhyme.
 */
import { buildSshDriveFields } from "./sshDriveFormFields.js";

const TITLE_ID = "awtsmoos-ssh-drive-dialog-title";

/**
 * Builds the SSH connection sheet without attaching lifecycle behavior.
 *
 * @param {object} profile Remembered non-secret SSH profile.
 * @returns {object} Structured dialog elements consumed by the controller.
 */
export function createSshDriveDialogView(profile = {}) {
	const overlay = document.createElement("div");
	overlay.className = "input-dialog-overlay";
	const dialog = document.createElement("div");
	dialog.className = "input-dialog ssh-drive-dialog";
	dialog.setAttribute("role", "dialog");
	dialog.setAttribute("aria-modal", "true");
	dialog.setAttribute("aria-labelledby", TITLE_ID);
	const header = createHeader(profile);
	const form = document.createElement("form");
	form.className = "ssh-drive-form";
	const fields = buildSshDriveFields(profile);
	const hint = document.createElement("p");
	hint.className = "ssh-drive-hint";
	hint.textContent = "Profile address details may be remembered. Passwords, private keys, and passphrases stay in memory only and are cleared when this sheet closes.";
	const status = document.createElement("p");
	status.className = "ssh-drive-status";
	status.setAttribute("role", "status");
	status.setAttribute("aria-live", "polite");
	status.setAttribute("aria-atomic", "true");
	const actions = document.createElement("div");
	actions.className = "dialog-buttons";
	const cancel = button("Cancel", "button");
	const submit = button(
		profile.name ? "Verify & Reconnect" : "Connect & Mount",
		"submit"
	);
	actions.append(cancel, submit);
	form.append(...fields.wrappers, hint, status, actions);
	dialog.append(header, form);
	overlay.append(dialog);
	return {
		overlay,
		dialog,
		form,
		fields: fields.inputs,
		status,
		submit,
		cancel,
		reconnecting: Boolean(profile.name)
	};
}

/**
 * Announces connection progress while preventing accidental duplicate submission.
 *
 * @param {object} view Dialog view record.
 * @param {boolean} busy Whether verification is active.
 * @param {boolean} preserveMessage Whether an error message should remain visible.
 * @returns {void}
 */
export function setSshDriveBusy(view, busy, preserveMessage = false) {
	view.submit.disabled = busy;
	view.cancel.disabled = busy;
	view.dialog.setAttribute("aria-busy", busy ? "true" : "false");
	view.submit.textContent = busy
		? "Connecting…"
		: view.reconnecting ? "Verify & Reconnect" : "Connect & Mount";
	if (busy || !preserveMessage) {
		view.status.dataset.state = busy ? "loading" : "";
		view.status.textContent = busy
			? "Verifying encrypted SSH access…"
			: "";
	}
}

function createHeader(profile) {
	const header = document.createElement("header");
	header.className = "ssh-drive-dialog-head";
	const badge = document.createElement("span");
	badge.className = "ssh-drive-security-badge";
	badge.textContent = "Secure SSH";
	const title = document.createElement("h2");
	title.id = TITLE_ID;
	title.className = "dialog-title";
	title.textContent = profile.name
		? `Reconnect ${profile.name}`
		: "Add Remote Computer";
	const copy = document.createElement("p");
	copy.className = "ssh-drive-dialog-copy";
	copy.textContent = profile.name
		? "Verify fresh credentials, then reopen this remembered remote world."
		: "Connect a real SSH host and mount it as a first-class Explorer drive.";
	header.append(badge, title, copy);
	return header;
}

function button(label, type) {
	const node = document.createElement("button");
	node.type = type;
	node.textContent = label;
	return node;
}
