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
 *
 * First paint waits only on the core OS graph. The secondary shell chambers
 * (actions, start menu, enhancements, profile, inbox, desktop signals)
 * load after the desktop is up, so their module graph (~76 files / ~157KB)
 * never delays the desktop itself.
 */
import AwtsmoosOS from "./awtsmoosOs.js";
import { hydrateShellIcons } from "./shell/iconHydration.js";
import { revealStartupFailure } from "./shell/startupRecovery.js";

hydrateShellIcons();
void revealOperatingSystem();

/** Starts the core OS, then attaches secondary shell chambers without making them fatal. */
async function revealOperatingSystem() {
	let os;
	try {
		os = new AwtsmoosOS();
		window.awtsmoosOs = os;
		await os.start();
	} catch (error) {
		console.error("B\"H Geelooy OS startup rupture.", error);
		revealStartupFailure(error);
		return;
	}
	const chambers = await loadShellChambers();
	const records = chambers.createShellActions ? chambers.createShellActions(os) : [];
	const disposers = [];
	if (chambers.bindStartMenu) disposers.push(chambers.bindStartMenu({ records }));
	if (chambers.initializeShellEnhancements) disposers.push(chambers.initializeShellEnhancements({ os, records }));
	if (chambers.bindDesktopSignals) chambers.bindDesktopSignals(os);
	await revealOptionalProfile(chambers.renderProfileDropdown);
	const disposeInbox = chambers.initializeSocialInbox
		? await revealOptionalInbox(os, chambers.initializeSocialInbox)
		: null;
	if (disposeInbox) disposers.push(disposeInbox);
	bindAppsCodeShortcut();
	revealLiveActionCount(records.length);
	bindCleanup(disposers);
}

/** Loads the secondary shell chambers after boot; a failed chamber stays optional. */
async function loadShellChambers() {
	const out = {};
	const wants = [
		["createShellActions", "./shell/actionCatalog.js"],
		["bindDesktopSignals", "./shell/desktopSignals.js"],
		["initializeShellEnhancements", "./shell/enhancements.js"],
		["bindStartMenu", "./shell/startMenuBindings.js"],
		["renderProfileDropdown", "./shell/profileBridge.js"],
		["initializeSocialInbox", "./social/inboxLauncher.js"]
	];
	await Promise.all(wants.map(async ([key, spec]) => {
		try {
			const mod = await import(spec);
			out[key] = mod[key];
		} catch (error) {
			console.warn(`B"H shell chamber ${key} remained optional.`, error);
		}
	}));
	return out;
}

/** Renders profile identity without allowing account UI to block the operating system. */
async function revealOptionalProfile(renderProfileDropdown) {
	const holder = document.getElementById("loginHolder");
	if (!holder || !renderProfileDropdown) return;
	try {
		await renderProfileDropdown(holder);
	} catch (error) {
		console.warn("B\"H profile controls remained optional.", error);
	}
}

/** Starts the social inbox as an optional OS chamber. */
async function revealOptionalInbox(os, initializeSocialInbox) {
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
	if (status) status.title = `${count} live apps and actions`;
}

/** Disposes shell bindings exactly once during navigation away. */
function bindCleanup(disposers) {
	window.addEventListener("beforeunload", () => {
		for (const dispose of disposers) dispose?.();
	}, { once: true });
}
