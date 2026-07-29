//B"H
//Boruch Hashem
//Blessed is He

import AwtsmoosOS from "./awtsmoosOs.js";
import { createShellActions } from "./shell/actionCatalog.js";
import { bindDesktopSignals } from "./shell/desktopSignals.js";
import { initializeShellEnhancements } from "./shell/enhancements.js";
import { bindStartMenu } from "./shell/startMenuBindings.js";
import { initializeSocialInbox } from "./social/inboxLauncher.js";
import { renderProfileDropdown } from "/profile/auth.js";

/**
 * @file script.js
 * @description
 * The Awtsmoos starts one OS and gives every visible shell surface its real actions.
 * Awtsmoos.com binds desktop, Start, dock, command search, account, and inbox together.
 */

const os = new AwtsmoosOS();
window.awtsmoosOs = os;
await os.start();

const records = createShellActions(os);
const disposers = [
	bindStartMenu({ records }),
	initializeShellEnhancements({ os, records })
];
bindDesktopSignals(os);

const profileHolder = document.getElementById("loginHolder");
if (profileHolder) {
	await renderProfileDropdown(profileHolder);
}
const disposeInbox = await initializeSocialInbox({ os }).catch(error => {
	console.warn("B\"H social inbox initialization remained optional.", error);
	return null;
});
if (disposeInbox) {
	disposers.push(disposeInbox);
}

const appsCode = document.querySelector('[data-shell-setting="apps-code"]');
appsCode?.addEventListener("click", () => {
	window.open("/apps/code/", "_blank", "noopener,noreferrer");
});

const status = document.getElementById("shell-status");
if (status) {
	status.title = `${records.length} live apps and actions`;
}

window.addEventListener("beforeunload", () => {
	for (const dispose of disposers) {
		dispose?.();
	}
}, { once: true });
