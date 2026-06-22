// B"H
/**
 * @module ProfileState
 * @description
 * Chapter 437: The profile app grows new chambers: graph, following, followers,
 * and recommendations. The hash is the doorway, the state is the breath.
 */

const allowedTabs = new Set(["posts", "comments", "heichelos", "tree", "activity", "history", "graph", "following", "followers", "recommendations"]);

export const profileState = {
    aliasId: "",
    viewerAliasId: "",
    profile: null,
    activeTab: "posts",
    drawerOpen: false,
    expandedTreeNodes: new Set(),
    follows: [],
    followers: [],
    graph: null,
    recommendations: []
};

export function setProfile(aliasId, profile) {
    profileState.aliasId = aliasId;
    profileState.profile = profile;
    profileState.viewerAliasId = window.curAlias || window.currentAlias || localStorage.getItem("BH_PROFILE_VIEWER_ALIAS") || "";
    const hashTab = location.hash ? location.hash.slice(1) : "";
    profileState.activeTab = allowedTabs.has(hashTab) ? hashTab : (profile.activeTemplate?.defaultTab || "posts");
    profileState.drawerOpen = false;
    profileState.follows = [];
    profileState.followers = [];
    profileState.graph = null;
    profileState.recommendations = [];
}

export function setTab(tab) {
    profileState.activeTab = allowedTabs.has(tab) ? tab : "posts";
    profileState.drawerOpen = false;
    if (history.replaceState) history.replaceState(null, "", `#${profileState.activeTab}`);
}

export function setDrawer(open) { profileState.drawerOpen = Boolean(open); }
export function toggleDrawer() { profileState.drawerOpen = !profileState.drawerOpen; }
export function setSocialExtras({ follows, followers, graph, recommendations } = {}) {
    if (Array.isArray(follows)) profileState.follows = follows;
    if (Array.isArray(followers)) profileState.followers = followers;
    if (graph) profileState.graph = graph;
    if (Array.isArray(recommendations)) profileState.recommendations = recommendations;
}
