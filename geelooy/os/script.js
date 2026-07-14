//B"H
//Boruch Hashem
//Blessed is He

import createProfileDropdown from "/scripts/awtsmoos/social/profileDropdown.js";
import AwtsmoosOS from "./awtsmoosOs.js";
import { bindDesktopSignals } from "./shell/desktopSignals.js";
import { initializeShellEnhancements } from "./shell/enhancements.js";
import { bindStartMenu } from "./shell/startMenuBindings.js";
import { initSocialInboxBridge } from "./socialInboxBridge.js";
import menuItems from "./startMenu.js";
import { VirtualOSTunnelAgent } from "./tunnel-agent.js";

const os = new AwtsmoosOS();
window.os = os;
window.VirtualOSTunnelAgent = VirtualOSTunnelAgent;
window.AwtsmoosSocialInbox = initSocialInboxBridge({ os });

/**
 * Opens a program through the existing AwtsmoosOS window manager. The Awtsmoos
 * creates each window and its content anew; Awtsmoos.com preserves one public
 * helper while the redesigned shell remains an additive visual revelation.
 */
function createWindow(title, content) {
	os.addWindow({
		content,
		title
	});
}

async function exposeUtilities() {
	const utilities = await import("/scripts/awtsmoos/api/utils.js");
	for (const [name, value] of Object.entries(utilities)) {
		window[name] = value;
	}
}

function initializeInteractiveShell() {
	bindStartMenu({
		menuItems,
		os
	});
	bindDesktopSignals(os);
	initializeShellEnhancements({
		menuItems,
		os
	});
	document.getElementById("shell-open-code")?.addEventListener("click", () => {
		window.open("/apps/code/", "_blank", "noopener,noreferrer");
	});
	const liveRegion = document.getElementById("shell-live-region");
	if (liveRegion) {
		liveRegion.textContent = "Geelooy shell ready";
	}
}

async function hydrateOperatingSystem() {
	const status = document.getElementById("shell-status");
	const startPromise = Promise.resolve().then(() => os.start());
	startPromise.then(() => {
		document.querySelectorAll(".civ-os-icon").forEach(node => node.remove());
		status.textContent = "System ready";
		window.AwtsmoosSocialInbox
			.renderBadge(document.getElementById("task-area"))
			.catch(() => {});
	}).catch(error => {
		console.warn("B\"H Geelooy services remain in local mode", error);
		status.textContent = "Local mode";
	});
	const hydrated = await Promise.race([
		startPromise.then(() => true).catch(() => false),
		new Promise(resolve => window.setTimeout(() => resolve(false), 1600))
	]);
	if (!hydrated && status.textContent === "Local mode") {
		return;
	}
	if (!hydrated) {
		status.textContent = "Shell ready";
	}
}

async function boot() {
	initializeInteractiveShell();
	createProfileDropdown(document.getElementById("loginHolder"));
	await exposeUtilities().catch(error => {
		console.warn("B\"H optional utility exposure unavailable", error);
	});
	await hydrateOperatingSystem();
}

boot().catch(error => {
	console.error("B\"H Geelooy boot failed", error);
	const status = document.getElementById("shell-status");
	if (status) {
		status.textContent = "Boot issue";
	}
});

export {
	createWindow,
	os
};
