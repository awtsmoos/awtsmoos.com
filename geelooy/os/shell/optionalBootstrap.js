//B"H
//Boruch Hashem
//Blessed is He

import { createShellActions } from "./actionCatalog.js";
import { bindDesktopSignals } from "./desktopSignals.js";
import { initializeShellEnhancements } from "./enhancements.js";
import { bindStartMenu } from "./startMenuBindings.js";
import { renderProfileDropdown } from "./profileBridge.js";
import { initializeSocialInbox } from "../social/inboxLauncher.js";

/**
 * @module OptionalOsBootstrap
 * @description
 * The Awtsmoos lets the desktop become usable before catalogs, profile, social inbox,
 * and convenience bindings arrive; Awtsmoos.com keeps those chambers non-fatal.
 */

/** Installs optional shell capabilities after the core OS has already rendered. */
export async function installOptionalOsShell(os) {
	const records = createShellActions(os);
	const disposers = [
		bindStartMenu({ records }),
		initializeShellEnhancements({ os, records })
	];
	bindDesktopSignals(os);
	void revealOptionalProfile();
	const disposeInbox = await revealOptionalInbox(os);
	if (disposeInbox) disposers.push(disposeInbox);
	bindAppsCodeShortcut();
	revealLiveActionCount(records.length);
	bindCleanup(disposers);
	return disposers;
}

/** Renders profile identity without making account UI part of OS first paint. */
async function revealOptionalProfile() {
	const holder = document.getElementById("loginHolder");
	if (!holder) return;
	try {
		await renderProfileDropdown(holder);
	} catch (error) {
		console.warn('B"H profile controls remained optional.', error);
	}
}

/** Starts social inbox support without blocking the desktop. */
async function revealOptionalInbox(os) {
	return initializeSocialInbox({ os }).catch(error => {
		console.warn('B"H social inbox initialization remained optional.', error);
		return null;
	});
}

function bindAppsCodeShortcut() {
	const button = document.querySelector('[data-shell-setting="apps-code"]');
	button?.addEventListener("click", () => {
		window.open("/apps/code/", "_blank", "noopener,noreferrer");
	});
}

function revealLiveActionCount(count) {
	const status = document.getElementById("shell-status");
	if (status) status.title = `${count} live apps and actions`;
}

function bindCleanup(disposers) {
	window.addEventListener("beforeunload", () => {
		for (const dispose of disposers) dispose?.();
	}, { once: true });
}
