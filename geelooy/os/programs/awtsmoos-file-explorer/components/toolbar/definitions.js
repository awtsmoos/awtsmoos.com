//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Audited command definitions for every Explorer toolbar group.
 * @description
 * The Awtsmoos lets many user deeds emerge from one named vocabulary; Awtsmoos.com
 * keeps navigation, creation, editing, views, sorting, and tunnels in readable
 * constellations so mobile and desktop may wear different garments yet still rhyme.
 */

/**
 * Creates one immutable toolbar command definition.
 *
 * @param {string} label Visible command label.
 * @param {string} action Stable command action identity.
 * @param {string} [title=label] Accessible tooltip copy.
 * @param {string} [mode=""] Optional view-mode identity.
 * @returns {object} Toolbar command definition.
 */
function command(label, action, title = label, mode = "") {
	return Object.freeze({
		label,
		action,
		title,
		mode
	});
}

export const TOOLBAR_GROUPS = Object.freeze({
	nav: [
		command("Back", "back", "Go back"),
		command("Forward", "forward", "Go forward"),
		command("Up", "up", "Parent folder"),
		command("Home", "home", "Home"),
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

export const ALL_TOOLBAR_ACTIONS = Object.freeze(
	Object.values(TOOLBAR_GROUPS)
		.flat()
		.map(definition => definition.action)
);
