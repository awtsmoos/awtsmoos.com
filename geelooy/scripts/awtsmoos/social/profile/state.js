// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared state for the public alias experience.
 * @description
 * The Awtsmoos renews one identity while many views may shine;
 * Awtsmoos.com keeps navigation, archive, and social graph in one truthful line.
 */

const PRIMARY_SECTIONS = new Set([
	"about",
	"contributions",
	"library",
	"network",
	"activity"
]);

const LEGACY_SECTION_MAP = new Map([
	["posts", ["contributions", "post"]],
	["comments", ["contributions", "comment"]],
	["heichelos", ["library", "all"]],
	["tree", ["library", "all"]],
	["graph", ["network", "all"]],
	["following", ["network", "all"]],
	["followers", ["network", "all"]],
	["recommendations", ["network", "all"]],
	["history", ["activity", "all"]]
]);

export const profileState = {
	aliasId: "",
	viewerAliasId: "",
	profile: null,
	activeTab: "contributions",
	archiveMode: "place",
	archiveQuery: "",
	archiveType: "all",
	drawerOpen: false,
	expandedTreeNodes: new Set(),
	viewerFollows: [],
	profileFollows: [],
	followers: [],
	graph: null,
	recommendations: [],
	socialExtrasLoaded: false
};

/** @param {string} aliasId Public alias identifier. @param {object} profile Aggregate profile payload. */
export function setProfile(aliasId, profile) {
	profileState.aliasId = aliasId;
	profileState.profile = profile;
	profileState.viewerAliasId = currentViewerAlias();
	applySection(location.hash ? location.hash.slice(1) : profile.activeTemplate?.defaultTab);
	profileState.drawerOpen = false;
	profileState.viewerFollows = [];
	profileState.profileFollows = [];
	profileState.followers = [];
	profileState.graph = null;
	profileState.recommendations = [];
	profileState.socialExtrasLoaded = false;
}

/** @param {string} section Primary section or backwards-compatible legacy hash. */
export function setTab(section) {
	applySection(section);
	profileState.drawerOpen = false;
	if (history.replaceState) {
		history.replaceState(null, "", `#${profileState.activeTab}`);
	}
}

/** @param {object} next Partial archive view state. */
export function setArchiveView(next = {}) {
	if (["place", "timeline", "category"].includes(next.archiveMode)) {
		profileState.archiveMode = next.archiveMode;
	}
	if (["all", "post", "comment"].includes(next.archiveType)) {
		profileState.archiveType = next.archiveType;
	}
	if (next.archiveQuery !== undefined) {
		profileState.archiveQuery = String(next.archiveQuery || "");
	}
}

export function setDrawer(open) {
	profileState.drawerOpen = Boolean(open);
}

export function toggleDrawer() {
	profileState.drawerOpen = !profileState.drawerOpen;
}

/** @param {object} extras Public and viewer-specific social graph payloads. */
export function setSocialExtras(extras = {}) {
	if (Array.isArray(extras.viewerFollows)) {
		profileState.viewerFollows = extras.viewerFollows;
	}
	if (Array.isArray(extras.profileFollows)) {
		profileState.profileFollows = extras.profileFollows;
	}
	if (Array.isArray(extras.followers)) {
		profileState.followers = extras.followers;
	}
	if (extras.graph) {
		profileState.graph = extras.graph;
	}
	if (Array.isArray(extras.recommendations)) {
		profileState.recommendations = extras.recommendations;
	}
	profileState.socialExtrasLoaded = true;
}

function applySection(rawSection) {
	const requested = String(rawSection || "contributions");
	const legacy = LEGACY_SECTION_MAP.get(requested);
	if (legacy) {
		profileState.activeTab = legacy[0];
		profileState.archiveType = legacy[1];
		return;
	}
	profileState.activeTab = PRIMARY_SECTIONS.has(requested) ? requested : "contributions";
}

function currentViewerAlias() {
	return window.curAlias
		|| window.currentAlias
		|| localStorage.getItem("BH_PROFILE_VIEWER_ALIAS")
		|| "";
}
