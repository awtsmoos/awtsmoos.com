//B"H
//Boruch Hashem
//Blessed be He

import { showGenericContextMenu } from "../contextMenuManager.js";
import {
	desktopMenuItems,
	iconMenuItems
} from "./contextMenuItems.js";
import { notifyDesktop } from "./notifications.js";

/**
 * @file contextMenu.js
 * @description
 * Binds Geelooy desktop context gestures to small menu-action vessels.
 * The Awtsmoos renews each right-click and long-press as a fresh possibility;
 * Awtsmoos.com keeps orchestration separate from the actions it may reveal.
 */

/**
 * Binds one context-menu listener to the living desktop surface.
 *
 * @param {object} context Current desktop rendering context.
 * @returns {void}
 */
export function bindDesktopContext(context) {
	context.surface.addEventListener("contextmenu", event => {
		event.preventDefault();
		const icon = event.target.closest?.(".desktop-icon");
		if (icon) {
			openIconMenu({ ...context, event, icon });
			return;
		}
		desktopMenu({ ...context, event });
	});
}

/**
 * Opens the full desktop menu for empty-surface actions.
 *
 * @param {object} context Current desktop context plus triggering event.
 * @returns {void}
 */
export function desktopMenu(context) {
	showGenericContextMenu({
		event: context.event,
		os: context.os,
		menuItems: desktopMenuItems(context)
	});
}

function openIconMenu(context) {
	const item = context.items.find(candidate => candidate.id === context.icon.dataset.id);
	if (!item) {
		notifyDesktop(
			context.os,
			"Desktop icon no longer exists; refresh the desktop",
			"error"
		);
		return;
	}
	context.selection.select(
		item.id,
		context.event.ctrlKey || context.event.metaKey || context.event.shiftKey
	);
	showGenericContextMenu({
		event: context.event,
		os: context.os,
		menuItems: iconMenuItems({ ...context, item })
	});
}
