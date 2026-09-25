//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Drive journey catalog.
 * @description
 * The Awtsmoos gives Awtsmoos Drive one human journey while deeper vessels remain reachable;
 * mobile creators see Build, Files, Preview, Publish, and More instead of infrastructure masquerading as navigation.
 */

const CATALOG = Object.freeze([
	panel("builder", "Build", "✦", "journey", true, true, "builder"),
	panel("files", "Files", "▤", "journey", false, true, "files"),
	panel("preview", "Preview", "◫", "journey", false, true, "preview"),
	panel("cloud", "Publish", "↗", "journey", false, true, "cloud"),
	panel("platform", "More", "•••", "journey", false, true, "platform"),
	panel("editor", "Editor", "⌘", "advanced", false, false, "files"),
	panel("domain", "Domain", "◎", "advanced", false, false, "platform"),
	panel("devices", "Devices", "⌁", "advanced", false, false, "platform"),
	panel("access", "Access", "◇", "advanced", false, false, "platform"),
	panel("runtime", "Runtime", "▶", "advanced", false, false, "platform")
]);

export const PANEL_IDS = Object.freeze(CATALOG.map(item => item.id));

/** Returns a defensive panel catalog copy for rendering. */
export function drivePanels() {
	return CATALOG.map(item => ({ ...item }));
}

/** Returns one panel definition or null when an unknown id is supplied. */
export function panelDefinition(panelId) {
	return CATALOG.find(item => item.id === panelId) || null;
}

/** Returns the five creator-facing mobile destinations in deliberate journey order. */
export function dockPanels() {
	return drivePanels().filter(item => item.dock);
}

/** Maps advanced screens back to the creator-facing destination that owns them. */
export function dockOwnerId(panelId) {
	const definition = panelDefinition(panelId);
	return definition?.dockOwner || panelId;
}

/** Keeps desktop disclosures open while mobile begins with one intentional screen. */
export function defaultPanelOpen(panelId, isMobile = false) {
	const definition = panelDefinition(panelId);
	if (!definition) return false;
	return isMobile ? Boolean(definition.mobileOpen) : Boolean(definition.desktopOpen);
}

/** Identifies the five top-level creator journey panels. */
export function isPrimaryPanel(panelId) {
	return panelDefinition(panelId)?.group === "journey";
}

function panel(id, label, icon, group, mobileOpen, dock, dockOwner) {
	return Object.freeze({
		id,
		label,
		icon,
		group,
		mobileOpen,
		desktopOpen: true,
		dock,
		dockOwner
	});
}
