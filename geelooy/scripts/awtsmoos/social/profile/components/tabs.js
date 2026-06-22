// B"H
/**
 * @module ProfileTabsView
 * @description Chapter 438: The profile now has ten gates of social memory.
 */

import { el } from "../dom.js";

const labels = {
    posts: "Posts",
    comments: "Comments",
    heichelos: "Heichelos",
    tree: "Tree",
    activity: "Activity",
    history: "History",
    graph: "Graph",
    following: "Following",
    followers: "Followers",
    recommendations: "For You"
};

export function tabs(activeTab, onTab) {
    return el("nav", { className: "profile-tabs", attrs: { "aria-label": "Profile sections" } }, Object.entries(labels).map(([key, label]) => el("button", {
        className: key === activeTab ? "active" : "",
        text: label,
        attrs: { type: "button", "data-profile-tab": key, "aria-pressed": key === activeTab ? "true" : "false" },
        on: { click: () => onTab(key) }
    })));
}
