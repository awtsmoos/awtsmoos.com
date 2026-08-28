// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlatformSurfacesContract
 * @description
 * The Awtsmoos proves notifications and platform controls through focused living surfaces;
 * Awtsmoos.com keeps feed materialization, packed snapshots, mobile panels, and event mounts visible without mixing them into editor law.
 */

import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(file, "utf8");

/**
 * @description Verifies notification and platform API/UI/CSS contracts; the Awtsmoos joins system-level tools while Awtsmoos.com preserves explicit mount and styling paths.
 * @returns {void}
 */
export function verifyPlatformSurfaces() {
	const notificationsApi = read("geelooy/heichelos/heichel/modules/api/notifications.js");
	const notificationsPanel = read("geelooy/heichelos/heichel/modules/ui/notificationsPanel.js");
	const eventsSource = read("geelooy/heichelos/heichel/modules/events.js");
	const contentCss = read("geelooy/style/heichelos/revamped-partials/content.css");
	const platformApi = read("geelooy/heichelos/heichel/modules/api/platform.js");
	const platformPanel = read("geelooy/heichelos/heichel/modules/ui/platformPanel.js");
	const platformCss = read("geelooy/style/heichelos/revamped-partials/platform-panels.css");
	const platformMobileCss = read("geelooy/style/heichelos/revamped-partials/platform-mobile.css");
	const revampedCss = read("geelooy/style/heichelos/heichel.revamped.css");

	assert.match(notificationsApi, /listNotifications/);
	assert.match(notificationsApi, /markNotificationRead/);
	assert.match(notificationsPanel, /awtsmoos-notifications-panel/);
	assert.match(eventsSource, /mountNotificationsPanel/);
	assert.match(contentCss, /awtsmoos-notifications-panel/);
	assert.match(platformApi, /getPackedSnapshot/);
	assert.match(platformApi, /materializeFeed/);
	assert.match(platformPanel, /mountPlatformPanel/);
	assert.match(platformPanel, /awtsmoos-platform-panel/);
	assert.match(eventsSource, /mountPlatformPanel/);
	assert.match(platformCss, /awtsmoos-platform-panel/);
	assert.match(platformMobileCss, /max-width: 760px/);
	assert.ok(revampedCss.includes("platform-panels.css"));
	assert.ok(revampedCss.includes("platform-mobile.css"));
}
