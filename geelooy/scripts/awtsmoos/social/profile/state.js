// B"H
/**
 * @module ProfileState
 * @description
 * Chapter 102: Hashes like /@coby#tree now open the correct chamber, and the
 * drawer can close explicitly so the three-bar menu never leaves the page in a
 * broken half-covered state.
 */

const allowedTabs = new Set(["posts", "comments", "heichelos", "tree", "activity"]);

export const profileState = {
    aliasId: "",
    profile: null,
    activeTab: "posts",
    drawerOpen: false,
    expandedTreeNodes: new Set()
};

export function setProfile(aliasId, profile) {
    profileState.aliasId = aliasId;
    profileState.profile = profile;
    const hashTab = location.hash ? location.hash.slice(1) : "";
    profileState.activeTab = allowedTabs.has(hashTab) ? hashTab : (profile.activeTemplate?.defaultTab || "posts");
    profileState.drawerOpen = false;
}

export function setTab(tab) {
    profileState.activeTab = allowedTabs.has(tab) ? tab : "posts";
    profileState.drawerOpen = false;
    if (history.replaceState) history.replaceState(null, "", `#${profileState.activeTab}`);
}

export function setDrawer(open) {
    profileState.drawerOpen = Boolean(open);
}

export function toggleDrawer() {
    profileState.drawerOpen = !profileState.drawerOpen;
}
