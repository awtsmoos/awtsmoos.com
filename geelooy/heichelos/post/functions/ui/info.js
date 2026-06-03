// B"H
/**
 * @file info.js
 * @description
 * Chapter 108: Scroll Details is washed clean.
 * Raw HTML and script text are not invited into the chamber. The Awtsmoos turns
 * metadata into safe plain text, polished cards, and symbolic book/person
 * graphics shaped by CSS classes rather than dangerous markup.
 */

import { GenesisEngine } from "../dom/GenesisEngine.js";
import { getLinkHrefOfEditing } from "../interaction/CoordinateInteraction.js";

function textOnly(value) {
    const raw = String(value ?? "");
    return raw
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function fallbackDescription(text) {
    const clean = textOnly(text);
    if (clean && !/[{};=<>]/.test(clean.slice(0, 240))) return clean;
    return "The main books of the entire Torah connect the reader to the Awtsmoos. These scrolls gather sacred wisdom, living commentary, and a path for study.";
}

function icon(name) {
    return { tag: "span", attr: { class: `awtsmoos-detail-svg awtsmoos-detail-svg-${name}`, "aria-hidden": "true" }, children: [{ tag: "span" }] };
}

function card({ title, subtitle, iconName, children }) {
    return { tag: "section", attr: { class: "awtsmoos-detail-card" }, children: [
        { tag: "header", attr: { class: "awtsmoos-detail-card-head" }, children: [icon(iconName), { tag: "div", attr: { class: "awtsmoos-detail-card-title" }, children: [
            { tag: "h3", children: [title] },
            subtitle ? { tag: "p", children: [subtitle] } : null
        ] }] },
        { tag: "div", attr: { class: "awtsmoos-detail-card-body" }, children }
    ] };
}

function linkPlan(text, href, className = "awtsmoos-detail-link") {
    return { tag: "a", attr: { href, class: className }, children: [textOnly(text)] };
}

function authorCard(alias) {
    const id = textOnly(alias.id || alias.name || "Anonymous");
    const name = textOnly(alias.name || alias.id || "Anonymous");
    return card({
        title: "Transmitted By",
        subtitle: "Author and living source",
        iconName: "person",
        children: [
            linkPlan(`@${name}`, `/@${encodeURIComponent(id)}`),
            { tag: "span", attr: { class: "awtsmoos-verified-sigil" }, children: ["✹ verified"] }
        ]
    });
}

function heichelCard(heichel) {
    const name = textOnly(heichel.name || heichel.id || "Unknown Heichel");
    const id = encodeURIComponent(textOnly(heichel.id || ""));
    return card({
        title: "Sacred Heichel",
        subtitle: "Place of this scroll",
        iconName: "book",
        children: [
            linkPlan(name, `/heichelos/${id}`),
            { tag: "p", attr: { class: "awtsmoos-detail-description" }, children: [fallbackDescription(heichel.description)] }
        ]
    });
}

function pathCard(heichel) {
    const crumb = Array.isArray(window.breadcrumb) ? window.breadcrumb.slice(1) : [];
    if (!crumb.length) return null;
    return card({
        title: "Revelation Path",
        subtitle: "Where this chapter lives",
        iconName: "path",
        children: [{ tag: "div", attr: { class: "awtsmoos-detail-path" }, children: crumb.map((q, index) => [
            linkPlan(q.name, `/heichelos/${encodeURIComponent(heichel.id || "")}/?series=${encodeURIComponent(q.id)}`),
            index < crumb.length - 1 ? { tag: "span", attr: { class: "awtsmoos-path-sep" }, children: ["/"] } : null
        ]).flat().filter(Boolean) }]
    });
}

function noticeCard() {
    return { tag: "aside", attr: { class: "awtsmoos-detail-notice" }, children: [
        { tag: "span", attr: { class: "awtsmoos-notice-icon" }, children: ["ⓘ"] },
        { tag: "p", children: ["These may contain AI translations. Double-check any translation before drawing important conclusions."] }
    ] };
}

function chapterNav(posts) {
    if (!Array.isArray(posts) || !posts.length) return null;
    let current = window.currentIndexInSeries;
    if (current === undefined || current === null) current = window.post?.id ? posts.indexOf(window.post.id) : 0;
    if (current < 0) current = 0;
    const basePath = location.pathname.split("/").slice(0, -1).join("/");
    return { tag: "nav", attr: { class: "awtsmoos-detail-nav", "aria-label": "Chapter navigation" }, children: [
        current > 0 ? linkPlan("← Prev", `${basePath}/${current - 1}`, "awtsmoos-detail-nav-btn") : null,
        { tag: "select", attr: { class: "series-chapter-select font-selector" }, children: posts.map((postId, index) => ({ tag: "option", attr: { value: index, ...(index === current ? { selected: true } : {}) }, children: [`Ch. ${index + 1} / ${posts.length}`] })), events: { change: event => { window.location.href = `${basePath}/${event.target.value}`; } } },
        current < posts.length - 1 ? linkPlan("Next →", `${basePath}/${current + 1}`, "awtsmoos-detail-nav-btn") : null
    ].filter(Boolean) };
}

function editLink(post, heichel) {
    if (!window.doesOwn) return null;
    return linkPlan("⚙️ Edit Post", `/heichelos/${encodeURIComponent(heichel.id)}/edit?type=post&id=${encodeURIComponent(post.id)}${getLinkHrefOfEditing()}`, "awtsmoos-detail-nav-btn danger");
}

export function makeInfoHTML() {
    const post = window.post || {};
    const alias = window.alias || { id: "Anonymous", name: "Hidden One" };
    const heichel = post.heichel || { id: "unknown", name: "Unknown Realm", description: "A sacred expanse." };
    return GenesisEngine.manifest({ tag: "div", attr: { class: "post-info-container awtsmoos-scroll-details-page" }, children: [
        { tag: "section", attr: { class: "awtsmoos-detail-hero" }, children: [icon("scroll"), { tag: "div", children: [{ tag: "h2", children: ["Scroll Details"] }, { tag: "p", children: ["Heichel, Author, & Path"] }] }] },
        authorCard(alias),
        heichelCard(heichel),
        noticeCard(),
        pathCard(heichel),
        chapterNav(window.series?.posts),
        editLink(post, heichel)
    ].filter(Boolean) });
}
