//B"H
//Boruch Hashem
//Blessed be He

import { copyDesktopDiagnostics } from "./diagnostics.js";
import {
	alignDesktop,
	alignDesktopIcon,
	arrangeDesktop
} from "./contextMenuLayoutActions.js";
import {
	openTunnelDesktop,
	openVirtualDesktop
} from "./contextMenuRemoteActions.js";
import { openDesktopIcon } from "./icons.js";
import { isDesktopLocked, toggleDesktopLock } from "./lockMode.js";
import { getDesktopMode, modeLabel, setDesktopMode } from "./modes.js";
import { currentPageLabel, nextPage, previousPage } from "./pages.js";
import { openDesktopSearch } from "./searchOverlay.js";
import { createDesktopShortcut } from "./shortcutCreator.js";
import { clearPositions } from "./storage.js";
import { installDesktopTemplate } from "./templates.js";
import { currentWallpaperTheme, nextWallpaperTheme } from "./wallpaper.js";

/**
 * @file contextMenuItems.js
 * @description
 * Builds inspectable action maps for desktop and icon context menus.
 * The Awtsmoos contains many possible actions without confusing their source;
 * Awtsmoos.com reveals each command as one named, bounded doorway.
 */

/** Returns the complete empty-desktop action map for the current surface. */
export function desktopMenuItems(context) {
	const { os, surface, items, allItems, positions, selection, rerender } = context;
	return new Map([
		[`Page: ${currentPageLabel()}`, () => changePage(nextPage, rerender)],
		["Next desktop page", () => changePage(nextPage, rerender)],
		["Previous desktop page", () => changePage(previousPage, rerender)],
		[`Mode: ${modeLabel()}`, () => cycleMode(rerender)],
		["Grid mode", () => chooseMode("grid", rerender)],
		["Free mode", () => chooseMode("free", rerender)],
		["Office mode", () => chooseMode("office", rerender)],
		[`Wallpaper: ${currentWallpaperTheme().label}`, () => changeWallpaper(rerender)],
		[isDesktopLocked() ? "Unlock desktop" : "Lock desktop", () => changeLock(rerender)],
		["Search desktop", () => openDesktopSearch({ os, surface, items: allItems || items, selection })],
		["Auto arrange", () => arrangeDesktop(surface, items, positions)],
		["Align to grid", () => alignDesktop(surface, positions)],
		["Install developer template", () => installTemplate("developer", os, rerender)],
		["Install explorer template", () => installTemplate("explorer", os, rerender)],
		["Copy Desktop Diagnostics", () => copyDesktopDiagnostics(context)],
		["New desktop shortcut", () => createDesktopShortcut(os)],
		["Open Native Tunnel Desktop", () => openTunnelDesktop(os)],
		["Open Virtual OS Desktop", () => openVirtualDesktop(os)],
		["Reset Icon Positions", () => resetPositions(rerender)]
	]);
}

/** Returns actions that are safe for the selected desktop item. */
export function iconMenuItems({ os, item, icon, positions, surface }) {
	return new Map([
		["Open", () => openDesktopIcon(os, item)],
		["Copy Path", () => copyPath(item)],
		["Align to grid", () => alignDesktopIcon(item, icon, positions, surface)]
	]);
}

function changePage(change, rerender) {
	change();
	rerender?.();
}

function cycleMode(rerender) {
	const modes = ["grid", "free", "office"];
	const currentIndex = modes.indexOf(getDesktopMode());
	chooseMode(modes[(currentIndex + 1) % modes.length], rerender);
}

function chooseMode(mode, rerender) {
	setDesktopMode(mode);
	rerender?.();
}

function changeWallpaper(rerender) {
	nextWallpaperTheme();
	rerender?.();
}

function changeLock(rerender) {
	toggleDesktopLock();
	rerender?.();
}

function installTemplate(name, os, rerender) {
	installDesktopTemplate(name, os);
	rerender?.();
}

function resetPositions(rerender) {
	clearPositions();
	rerender?.();
}

function copyPath(item) {
	if (item.path) {
		navigator.clipboard?.writeText(item.path);
	}
}
