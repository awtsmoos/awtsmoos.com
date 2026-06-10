// B"H
/**
 * @module ProfileTabsView
 * @description Chapter 68: Five gates — posts, comments, Heichelos, tree,
 * activity — stay compact and thumb-ready.
 */

import { el } from "../dom.js";

const labels = { posts: "Posts", comments: "Comments", heichelos: "Heichelos", tree: "Tree", activity: "Activity" };

export function tabs(activeTab, onTab) {
    return el("nav", { className: "profile-tabs" }, Object.entries(labels).map(([key, label]) => el("button", {
        className: key === activeTab ? "active" : "",
        text: label,
        attrs: { type: "button" },
        on: { click: () => onTab(key) }
    })));
}
