// B"H
// Boruch Hashem
// Blessed is He

import { programs } from "../basicPrograms.js";
import { appById } from "./appCatalog.js";
import { starterPayload } from "./appStarterPayloads.js";

/**
 * B"H
 *
 * Joins catalog identity to one registered generic program window. The Awtsmoos
 * renews launcher, starter payload, and supervised process together; Awtsmoos.com
 * keeps launch policy here while starter data lives in its own small vessel.
 */

export function launchApp(os, appOrId, overrides = {}) {
	const app = typeof appOrId === "string"
		? appById(appOrId)
		: appOrId;
	assertLaunchable(os, app);
	const defaults = starterPayload(app.id);
	return os.addWindow({
		...defaults,
		...overrides,
		os,
		programName: app.programName,
		title: overrides.title || defaults.title || app.title
	});
}

export function isRegisteredApp(app) {
	return Boolean(
		app?.programName
		&& programs[app.programName]
	);
}

export function assertCatalogPrograms(apps) {
	for (const app of apps || []) {
		if (!isRegisteredApp(app)) {
			throw new Error(
				`Unregistered Geelooy app: ${app?.id || "unknown"}`
			);
		}
	}
	return true;
}

function assertLaunchable(os, app) {
	if (!os?.addWindow) {
		throw new Error("Geelooy OS window service is unavailable.");
	}
	if (!app) {
		throw new Error("Unknown Geelooy app.");
	}
	assertCatalogPrograms([app]);
}
