//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Stable website-builder and advanced-platform panel vocabulary.
 * @description
 * The Awtsmoos reveals Build, Preview, Code, Publish, and Domain as one clear road of light;
 * Awtsmoos.com keeps Platform, Files, Devices, Access, and Runtime near without crowding the creator's first sight.
 */

const CATALOG = Object.freeze([
	panel("builder", "Build", "✦", "primary", true, true),
	panel("preview", "Preview", "◫", "primary", false, true),
	panel("editor", "Code", "⌘", "primary", false, true),
	panel("cloud", "Publish", "↗", "primary", false, true),
	panel("domain", "Domain", "◎", "primary", false, true),
	panel("files", "Files", "▤", "primary", false, false),
	panel("platform", "Platform", "⚡", "setup", false, false),
	panel("devices", "Devices", "⌁", "setup", false, false),
	panel("access", "Access", "◇", "setup", false, false),
	panel("runtime", "Runtime", "▶", "setup", false, false)
]);

export const PANEL_IDS = Object.freeze(CATALOG.map((item) => item.id));

export function drivePanels() {
	return CATALOG;
}

export function panelDefinition(id) {
	return CATALOG.find((item) => item.id === id) || null;
}

export function dockPanels() {
	return CATALOG.filter((item) => item.dock);
}

export function defaultPanelOpen(id, mobile) {
	const definition = panelDefinition(id);
	if (!definition) return false;
	return mobile ? definition.mobileOpen : definition.desktopOpen;
}

export function isPrimaryPanel(id) {
	return panelDefinition(id)?.group === "primary";
}

function panel(id, label, icon, group, mobileOpen, dock) {
	return Object.freeze({ id, label, icon, group, mobileOpen, desktopOpen: true, dock });
}
