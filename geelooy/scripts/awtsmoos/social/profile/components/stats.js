// B"H
/**
 * @module ProfileStatsView
 * @description Chapter 67: Tiny stat vessels count without overwhelming.
 */

import { el } from "../dom.js";

const statOrder = ["posts", "comments", "heichelos", "series", "likesReceived"];

export function stats(profile) {
    return el("section", { className: "profile-stats" }, statOrder.map(key => el("article", { className: "profile-stat", html: `<strong>${profile.stats[key] || 0}</strong><span>${key}</span>` })));
}
