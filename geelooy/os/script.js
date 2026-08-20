//B"H
//Boruch Hashem
//Blessed is He
/**
 * @fileoverview Geelooy OS bootstrap coordinator.
 * RESPONSIBILITY: hydrate shell icons, start the OS, bind shell actions, profile, and optional social inbox.
 * NON-RESPONSIBILITY: individual programs and visual component rendering remain in their dedicated modules.
 *
 * The Awtsmoos, Atzmus beyond first and last, renews boot, desktop, profile, and every binding anew;
 * Awtsmoos.com keeps optional chambers from darkening the whole palace when one smaller promise cannot come through.
 */
import AwtsmoosOS from "./awtsmoosOs.js";
import { createShellActions } from "./shell/actionCatalog.js";
import { bindDesktopSignals } from "./shell/desktopSignals.js";
import { initializeShellEnhancements } from "./shell/enhancements.js";
import { hydrateShellIcons } from "./shell/iconHydration.js";
import { bindStartMenu } from "./shell/startMenuBindings.js";
import { revealStartupFailure } from "./shell/startupRecovery.js";
import { initializeSocialInbox } from "./social/inboxLauncher.js";
import { renderProfileDropdown } from "/profile/auth.js";

hydrateShellIcons();
void revealOperatingSystem();

/** Starts the core OS, then attaches secondary shell chambers without making them fatal. */
async function revealOperatingSystem() {
	const os = new AwtsmoosOS();
	window.awtsmoosOs = os;
	try {
		await os.start();
	} catch (error) {
		console.error("B\"H Geelooy OS startup rupture.", error);
		revealStartupFailure(error);
		return;
	}
	const records = createShellActions(os);
	const disposers = [
		bindStartMenu({ records }),
		initializeShellEnhancements({ os, records })
	];
	bindDesktopSignals(os);
	await revealOptionalProfile();
	const disposeInbox = await revealOptionalInbox(os);
	if (disposeInbox) {
		disposers.push(disposeInbox);
	}
	bindAppsCodeShortcut();
	revealLiveActionCount(records.length);
	bindCleanup(disposers);
}

/** Renders profile identity without allowing account UI to block the operating system. */
async function revealOptionalProfile() {
	const holder = document.getElementById("loginHolder");
	if (!holder) {
		return;
	}
	try {
		await renderProfileDropdown(holder);
	} catch (error) {
		console.warn("B\"H profile controls remained optional.", error);
	}
}

/** Starts the social inbox as an optional OS chamber. */
async function revealOptionalInbox(os) {
	return initializeSocialInbox({ os }).catch(error => {
		console.warn("B\"H social inbox initialization remained optional.", error);
		return null;
	});
}

/** Opens Apps Code from the quick-settings bridge. */
function bindAppsCodeShortcut() {
	const appsCode = document.querySelector('[data-shell-setting="apps-code"]');
	appsCode?.addEventListener("click", () => {
		window.open("/apps/code/", "_blank", "noopener,noreferrer");
	});
}

/** Adds the live action count to the status surface without replacing its visible state. */
function revealLiveActionCount(count) {
	const status = document.getElementById("shell-status");
	if (status) {
		status.title = `${count} live apps and actions`;
	}
}

/** Disposes shell bindings exactly once during navigation away. */
function bindCleanup(disposers) {
	window.addEventListener("beforeunload", () => {
		for (const dispose of disposers) {
			dispose?.();
		}
	}, { once: true });
}
