// B"H
/**
 * @module ProfileHistoryCard
 * @description Chapter 423: Continue reading becomes a physical doorway.
 */

import { el, clean } from "../dom.js";

function when(value) {
    const date = Number(value || 0) ? new Date(Number(value)) : null;
    return date ? date.toLocaleString() : "recently";
}

function target(item) {
    if (item.url) return item.url;
    if (item.type === "post" && item.heichelId && item.seriesId && item.postId) {
        return `/heichelos/${encodeURIComponent(item.heichelId)}/series/${encodeURIComponent(item.seriesId)}/${encodeURIComponent(item.postId)}`;
    }
    if (item.heichelId && item.seriesId) return `/heichelos/${encodeURIComponent(item.heichelId)}/series/${encodeURIComponent(item.seriesId)}`;
    if (item.heichelId) return `/heichelos/${encodeURIComponent(item.heichelId)}`;
    return "#";
}

export function historyCard(item) {
    return el("article", {
        className: "profile-history-card",
        html: `<small>${clean(item.type)} · ${when(item.viewedAt)}</small><h3>${clean(item.title)}</h3><p>${clean(item.heichelId || item.url || item.id)}</p><footer>Continue from here</footer>`,
        on: { click: () => { const href = target(item); if (href !== "#") location.href = href; } }
    });
}
