// B"H
/** Scroll Details with current post, current series, ancestors, author, and heichel. */
import { GenesisEngine } from "../dom/GenesisEngine.js";
import { getLinkHrefOfEditing } from "../interaction/CoordinateInteraction.js";
function textOnly(value) {
    return String(value ?? "").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
}
function icon(name) { return { tag:"span", attr:{ class:`awtsmoos-detail-svg awtsmoos-detail-svg-${name}`, "aria-hidden":"true" }, children:[{ tag:"span" }] }; }
function card({ title, subtitle, iconName, children }) {
    return { tag:"section", attr:{ class:"awtsmoos-detail-card" }, children:[
        { tag:"header", attr:{ class:"awtsmoos-detail-card-head" }, children:[icon(iconName), { tag:"div", attr:{ class:"awtsmoos-detail-card-title" }, children:[{ tag:"h3", children:[title] }, subtitle ? { tag:"p", children:[subtitle] } : null] }] },
        { tag:"div", attr:{ class:"awtsmoos-detail-card-body" }, children }
    ] };
}
function linkPlan(text, href, className="awtsmoos-detail-link") { return { tag:"a", attr:{ href, class:className }, children:[textOnly(text)] }; }
function currentPostCard(post) {
    const title = textOnly(post.title || post.name || post.id || "Untitled scroll");
    return card({ title:"Current Scroll", subtitle:"The chapter open right now", iconName:"scroll", children:[
        { tag:"strong", attr:{ class:"awtsmoos-current-detail-name" }, children:[title] },
        { tag:"code", children:[textOnly(post.id || "")] }
    ] });
}
function currentSeriesCard(series, heichel) {
    const details = series?.prateem || series || {};
    const name = textOnly(details.name || details.title || series?.id || "Unknown series");
    const id = textOnly(series?.id || window.post?.parentSeriesId || "root");
    return card({ title:"Current Series", subtitle:"The immediate parent of this scroll", iconName:"book", children:[
        linkPlan(name, `/heichelos/${encodeURIComponent(heichel.id || "")}/?series=${encodeURIComponent(id)}`),
        { tag:"code", children:[id] }
    ] });
}
function authorCard(alias) {
    const id = textOnly(alias.id || alias.name || "Anonymous");
    const name = textOnly(alias.name || alias.id || "Anonymous");
    return card({ title:"Transmitted By", subtitle:"Author and living source", iconName:"person", children:[linkPlan(`@${name}`, `/@${encodeURIComponent(id)}`)] });
}
function heichelCard(heichel) {
    const name = textOnly(heichel.name || heichel.id || "Unknown Heichel");
    return card({ title:"Sacred Heichel", subtitle:"Place of this scroll", iconName:"book", children:[linkPlan(name, `/heichelos/${encodeURIComponent(heichel.id || "")}`), { tag:"p", children:[textOnly(heichel.description || "A sacred expanse.")] }] });
}
function pathCard(heichel) {
    const crumbs = Array.isArray(window.breadcrumb) ? window.breadcrumb : [];
    if (!crumbs.length) return null;
    return card({ title:"Ancestor Path", subtitle:"Parents above the current series", iconName:"path", children:[{ tag:"div", attr:{ class:"awtsmoos-detail-path" }, children:crumbs.map((q,index) => [linkPlan(q.name || q.id, `/heichelos/${encodeURIComponent(heichel.id || "")}/?series=${encodeURIComponent(q.id || "root")}`), index < crumbs.length - 1 ? { tag:"span", attr:{ class:"awtsmoos-path-sep" }, children:["/"] } : null]).flat().filter(Boolean) }] });
}
function chapterNav(posts) {
    if (!Array.isArray(posts) || !posts.length) return null;
    let current = Number(window.currentIndexInSeries ?? posts.indexOf(window.post?.id));
    if (!Number.isFinite(current) || current < 0) current = 0;
    const base = location.pathname.split("/").slice(0,-1).join("/");
    return { tag:"nav", attr:{ class:"awtsmoos-detail-nav" }, children:[
        current > 0 ? linkPlan("← Prev", `${base}/${current-1}`, "awtsmoos-detail-nav-btn") : null,
        { tag:"span", children:[`Chapter ${current+1} of ${posts.length}`] },
        current < posts.length-1 ? linkPlan("Next →", `${base}/${current+1}`, "awtsmoos-detail-nav-btn") : null
    ].filter(Boolean) };
}
function editLink(post, heichel) {
    if (!window.doesOwn) return null;
    return linkPlan("⚙️ Edit Post", `/heichelos/${encodeURIComponent(heichel.id)}/edit?type=post&id=${encodeURIComponent(post.id)}${getLinkHrefOfEditing()}`, "awtsmoos-detail-nav-btn danger");
}
export function makeInfoHTML() {
    const post = window.post || {};
    const alias = window.alias || { id:"Anonymous" };
    const heichel = post.heichel || { id:window.heichelId || "unknown" };
    return GenesisEngine.manifest({ tag:"div", attr:{ class:"post-info-container awtsmoos-scroll-details-page" }, children:[
        { tag:"section", attr:{ class:"awtsmoos-detail-hero" }, children:[icon("scroll"), { tag:"div", children:[{ tag:"h2", children:["Scroll Details"] }, { tag:"p", children:["Current name, series, author, and path"] }] }] },
        currentPostCard(post), currentSeriesCard(window.series, heichel), authorCard(alias), heichelCard(heichel), pathCard(heichel), chapterNav(window.series?.posts), editLink(post, heichel)
    ].filter(Boolean) });
}
