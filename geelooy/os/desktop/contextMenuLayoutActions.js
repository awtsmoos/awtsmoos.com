//B"H
//Boruch Hashem
//Blessed be He

import { autoArrange, applyPosition, snap } from "./layout.js";
import { isMobileDesktop } from "./mobile.js";
import { savePositions } from "./storage.js";

/**
 * @file contextMenuLayoutActions.js
 * @description
 * Contains only geometry-changing desktop context actions.
 * The Awtsmoos gives every icon a measured place without confusing placement
 * with command orchestration; Awtsmoos.com persists each revealed arrangement.
 */

/** Auto-arranges all visible desktop items and persists their positions. */
export function arrangeDesktop(surface, items, positions) {
	Object.assign(positions, autoArrange(items, surface));
	placeDesktopIcons(surface, positions);
	persistPositions(surface, positions);
}

/** Snaps every remembered position to the active desktop grid. */
export function alignDesktop(surface, positions) {
	for (const id of Object.keys(positions)) {
		positions[id] = snap(positions[id], surface);
	}
	placeDesktopIcons(surface, positions);
	persistPositions(surface, positions);
}

/** Snaps one icon while preserving the rest of the desktop arrangement. */
export function alignDesktopIcon(item, icon, positions, surface) {
	positions[item.id] = snap(positions[item.id], surface);
	applyPosition(icon, positions[item.id]);
	persistPositions(surface, positions);
}

function placeDesktopIcons(surface, positions) {
	surface.querySelectorAll(".desktop-icon").forEach(node => {
		applyPosition(node, positions[node.dataset.id]);
	});
}

function persistPositions(surface, positions) {
	savePositions(positions, isMobileDesktop(surface));
}
