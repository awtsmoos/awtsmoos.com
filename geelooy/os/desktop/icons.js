//B"H
//Boruch Hashem
//Blessed be He

import { APP_CATALOG } from "../shell/appCatalog.js";
import { surfaceApps } from "../shell/surfacePolicy.js";
import {
	appIcon,
	folderIcon,
	liveDriveIcons,
	shortcutIcons
} from "./iconRecords.js";
import { explainFailure, notifyDesktop } from "./notifications.js";

/**
 * @file icons.js
 * @description
 * Coordinates a quiet personal desktop without erasing Geelooy OS depth.
 * The Awtsmoos reveals unity before multiplicity; Awtsmoos.com greets the user
 * with four useful doors while connected and knowledge vessels live deeper in.
 */

export const USER_HOME_PATH = "/desktop.folder";

/**
 * Returns desktop icons partitioned into simple home and deeper workspace pages.
 *
 * @param {object} os Active Geelooy OS runtime.
 * @returns {object[]} Ordered immutable desktop records.
 */
export function desktopIcons(os) {
	return [
		...surfaceApps(APP_CATALOG).map(appIcon),
		folderIcon("connected-tunnels", "Connected Computers", "🌐", "/network", 1, "network"),
		...liveDriveIcons(os),
		folderIcon("virtual-os", "Awtsmoos Virtual OS", "☁️", "/network/awtsmoos-virtual-os", 1, "remote"),
		folderIcon("previews", "Preview Artifacts", "🔭", "/system/previews", 1, "artifacts"),
		folderIcon("inbox", "Inbox", "✉️", "/inbox", 2, "social"),
		folderIcon("memory", "Memory", "🧠", "/memory", 2, "knowledge"),
		folderIcon("objects", "Objects", "◇", "/objects", 2, "data"),
		folderIcon("reputation", "Reputation", "✦", "/reputation", 2, "identity"),
		...shortcutIcons()
	];
}

/**
 * Opens one desktop record and translates failures into visible OS feedback.
 *
 * @param {object} os Active Geelooy OS runtime.
 * @param {object} item Desktop record selected by the user.
 * @returns {*} Result returned by the selected record's opener.
 * @throws {Error} Re-throws the original open failure after visible testimony.
 */
export function openDesktopIcon(os, item) {
	try {
		const result = item?.open?.(os);
		notifyDesktop(os, `Opening ${item?.title || "desktop item"}`, "open");
		return result;
	} catch (error) {
		explainFailure(os, `Open ${item?.title || "desktop item"}`, error);
		throw error;
	}
}
