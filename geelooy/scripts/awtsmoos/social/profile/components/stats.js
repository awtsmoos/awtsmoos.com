// B"H
/**
 * @module ProfileStatsView
 * @description Chapter 67: Tiny stat vessels count without overwhelming.
 */

import { el } from "../dom.js";

const statOrder = ["posts", "comments", "heichelos", "series", "likesReceived"];

// B"H social fix 4 (defect 6): the labels were raw keys ("likesReceived")
// and the number ran straight into the label ("2posts"). Human labels,
// and a space between number and label as well as the CSS gap below.
const statLabels = { posts: "Posts", comments: "Comments", heichelos: "Heichelos", series: "Series", likesReceived: "Likes received" };

export function stats(profile) {
    return el("section", { className: "profile-stats" }, statOrder.map(key => el("article", { className: "profile-stat", html: `<strong>${profile.stats[key] || 0}</strong> <span>${statLabels[key] || key}</span>` })));
}
