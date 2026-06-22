// B"H
/**
 * @module ProfileActivityFeed
 * @description Chapter 440: Activity turns posts and comments into a living river.
 */

import { el, clean, emptyCard } from "../dom.js";

function routeFor(item) {
    const source = item.source || item;
    if (item.kind === "comment" || source.content) return `/heichelos/${encodeURIComponent(source.heichelId || "")}/series/${encodeURIComponent(source.seriesId || "root")}/${encodeURIComponent(source.postId || "")}`;
    return `/heichelos/${encodeURIComponent(source.heichelId || "")}/series/${encodeURIComponent(source.seriesId || "root")}/${encodeURIComponent(source.postId || source.id || "")}`;
}

function titleFor(item) {
    const source = item.source || item;
    if (item.kind === "comment") return `Commented on ${source.postTitle || source.postId || "a post"}`;
    return source.title || item.title || item.id || "Activity";
}

export function activityFeed(items = []) {
    const wrap = el("section", { className: "profile-activity-feed" }, [el("h2", { text: "Recent Activity" })]);
    if (!items.length) return el("section", { className: "profile-activity-feed" }, [emptyCard("No activity yet.")]);
    items.forEach(item => wrap.appendChild(el("article", {
        className: `profile-activity-item ${clean(item.kind || item.type || "activity")}`,
        html: `<small>${clean(item.kind || item.type || "activity")}</small><h3>${clean(titleFor(item))}</h3><p>${clean((item.source || item).excerpt || (item.source || item).content || "")}</p>`,
        on: { click: () => { const href = routeFor(item); if (!href.includes("undefined")) location.href = href; } }
    })));
    return wrap;
}
