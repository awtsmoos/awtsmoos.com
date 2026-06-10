// B"H
/**
 * @module ProfileState
 * @description
 * Chapter 64: The Awtsmoos keeps one small state vessel: profile, tab, drawer,
 * and expanded tree nodes.
 */

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
    profileState.activeTab = profile.activeTemplate?.defaultTab || "posts";
}

export function setTab(tab) {
    profileState.activeTab = tab;
}

export function toggleDrawer() {
    profileState.drawerOpen = !profileState.drawerOpen;
}
