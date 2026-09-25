//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Audited command definitions and disclosure policy for the Explorer toolbar.
 * @description
 * The Awtsmoos lets every deed remain present while the eye receives only what it needs;
 * Awtsmoos.com keeps primary file roads in open light and folds advanced powers into More without severing their seeds.
 */

/**
 * Creates one immutable toolbar command definition.
 * @param {string} label Visible command label.
 * @param {string} action Stable command action identity.
 * @param {string} [title=label] Accessible tooltip copy.
 * @param {string} [mode=""] Optional view-mode identity.
 * @returns {object} Frozen toolbar command definition.
 */
function command(label, action, title = label, mode = "") {
	return Object.freeze({ label, action, title, mode });
}

export const TOOLBAR_GROUPS = Object.freeze({
	nav: [
		command("Back", "back", "Go back"),
		command("Forward", "forward", "Go forward"),
		command("Up", "up", "Parent folder"),
		command("Home", "home"),
		command("Refresh", "refresh", "Refresh files and tunnels")
	],
	create: [
		command("New File", "newFile"),
		command("New Folder", "newFolder"),
		command("Import", "import")
	],
	edit: [
		command("Open", "open"),
		command("Edit", "edit"),
		command("Preview", "preview"),
		command("Copy Path", "copyPath")
	],
	clip: [
		command("Copy", "copy"),
		command("Cut", "cut"),
		command("Paste", "paste"),
		command("Rename", "rename"),
		command("Delete", "delete")
	],
	select: [
		command("Select All", "selectAll"),
		command("Clear", "clearSelection")
	],
	view: [
		command("Icons", "icons", "Icons view", "icons"),
		command("Details", "details", "Details view", "details"),
		command("List", "list", "List view", "list"),
		command("Tiles", "tiles", "Tiles view", "tiles")
	],
	sort: [
		command("Sort Name", "sortName"),
		command("Sort Type", "sortType"),
		command("Sort Status", "sortStatus"),
		command("Filter", "filter", "Apply current search filter")
	],
	tunnel: [
		command("Tunnels", "tunnels"),
		command("Mounts", "mounts"),
		command("Connect", "connect"),
		command("Disconnect", "disconnect")
	]
});

export const PRIMARY_TOOLBAR_GROUP_NAMES = Object.freeze([
	"nav",
	"create",
	"view",
	"sort"
]);

export const OVERFLOW_TOOLBAR_GROUP_NAMES = Object.freeze([
	"edit",
	"clip",
	"select",
	"tunnel"
]);

export const ALL_TOOLBAR_ACTIONS = Object.freeze(
	Object.values(TOOLBAR_GROUPS).flat().map(definition => definition.action)
);
