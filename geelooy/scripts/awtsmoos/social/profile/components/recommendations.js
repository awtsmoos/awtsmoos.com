// B"H
/**
 * @module ProfileRecommendations
 * @description Chapter 441: The profile can suggest nearby chambers without a
 * dopamine machine; only paths with reasons.
 */

import { el, clean, emptyCard } from "../dom.js";

function hrefFor(item) {
    if (item.type === "heichel") return `/heichelos/${encodeURIComponent(item.id)}`;
    if (item.type === "alias") return `/@${encodeURIComponent(item.id)}`;
    return "#";
}

export function recommendations(items = []) {
    const wrap = el("section", { className: "profile-recommendations" }, [el("h2", { text: "Recommended Paths" })]);
    if (!items.length) return el("section", { className: "profile-recommendations" }, [emptyCard("No recommendations yet.")]);
    items.forEach(item => wrap.appendChild(el("a", {
        className: "profile-recommendation-card",
        html: `<small>${clean(item.type)}</small><h3>${clean(item.title || item.id)}</h3><p>${clean(item.reason || "A nearby social path.")}</p>` ,
        attrs: { href: hrefFor(item) }
    })));
    return wrap;
}
