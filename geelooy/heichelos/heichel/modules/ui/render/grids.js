// B"H
/**
 * @module MobileNavigationGrids
 * @description
 * Chapter 740: The branch opens, closes, remembers, and still lets every child walk.
 * The Awtsmoos hides no post viewer change here; only the browsing tree breathes.
 */
import { DOMElements } from "../../dom.js";
import { ScribeOfManifestation } from "../../engine/scribe-of-manifestation.js";
import { showContextMenu } from "../contextmenu.js";
import { getItemKey } from "../../state.js";
import { socialActionBlueprints } from "./social-actions.js";
import { renderSidebarComments } from "../sidebar-comments.js";
import { notify } from "./toast.js";
import { normalizeCardData } from "./cardData.js";
import { normalizeCollection } from "../../navigator/content-normalizer.js";
import * as api from "../../api.js";

let globalMenuClosersInstalled = false;
const expandedCache = new Map();

export function renderContentGrids(content, navigator, appState) {
    ensureGlobalMenuClosers();
    manifestSpecificGrid(content.posts, DOMElements.postsList, "post", navigator, appState);
    manifestSpecificGrid(content.subSeries, DOMElements.seriesList, "series", navigator, appState);
}

function manifestSpecificGrid(items, container, type, navigator, appState) {
    if (!container) return;
    container.replaceChildren();
    if (!items?.length) return container.appendChild(ScribeOfManifestation.speakElement(emptyBlueprint(type)));
    items.forEach(item => container.appendChild(ScribeOfManifestation.speakElement(cardBlueprint(item, type, navigator, appState, 0))));
}

function emptyBlueprint(type) {
    const noun = type === "series" ? "series" : "posts";
    return { tag: "div", attr: { class: "empty-glow-msg", role: "status" }, children: [
        { tag: "span", attr: { class: "empty-orb", "aria-hidden": "true" }, children: [type === "series" ? "⌁" : "✦"] },
        { tag: "strong", children: [`No ${noun} here yet`] },
        { tag: "span", children: [type === "series" ? "This branch is quiet, ready for another chamber." : "This shelf is waiting for its first revealed post."] }
    ] };
}

function cardBlueprint(item, type, navigator, appState, depth) {
    const data = normalizeCardData(item, type);
    const isSelected = appState.selectedItems.has(getItemKey({ id: data.id, type }));
    const kidsId = `series-children-${String(data.id).replace(/[^a-z0-9_-]/gi, "-")}`;
    return { tag: "article", attr: { class: `nav-card ${type}-nav-card ${isSelected ? "selected" : ""}`, "data-id": data.id, "data-type": type, "data-depth": depth, "aria-label": `${type === "series" ? "Open series" : "Open post"}: ${data.title}` }, events: { click: event => handleCardSelectionOrNav(event, data, item, navigator, appState) }, children: [cardMedia(data), cardBody(data, type), cardActions(data, navigator, appState, item, kidsId, depth), childrenWell(type, kidsId)] };
}

function cardActions(data, navigator, appState, item, kidsId, depth) {
    return { tag: "div", attr: { class: "nav-card-actions" }, children: [expandButton(data, navigator, appState, kidsId, depth), cardMenuBlueprint(data, navigator, appState, item)].filter(Boolean) };
}

function expandButton(data, navigator, appState, kidsId, depth) {
    if (data.type !== "series") return null;
    return { tag: "button", attr: { type: "button", class: "series-expand-toggle", "aria-expanded": "false", "aria-controls": kidsId, "aria-label": `Expand ${data.title}` }, children: ["⌄"], events: { click: event => toggleSeriesBranch(event, data, navigator, appState, kidsId, depth) } };
}

function childrenWell(type, id) { return type === "series" ? { tag: "div", attr: { id, class: "series-children-well", hidden: "" } } : null; }
function cardMedia(data) { return { tag: "div", attr: { class: "nav-card-media", style: data.thumbnail ? `background-image:url('${data.thumbnail}')` : "", "aria-hidden": "true" }, children: [{ tag: "span", children: [data.type === "series" ? "S" : "P"] }] }; }
function cardBody(data, type) { return { tag: "div", attr: { class: "nav-card-body" }, children: [titleRow(data), descriptionNode(data, type), metaFooter(data, type)] }; }
function titleRow(data) { return { tag: "div", attr: { class: "nav-card-title-row" }, children: [{ tag: "h2", children: [data.title] }, { tag: "span", attr: { class: "nav-card-chevron", "aria-hidden": "true" }, children: ["›"] }] }; }
function descriptionNode(data, type) { return { tag: "p", children: [data.description || (type === "series" ? "Open or expand this series path." : "Open this reader post.")] }; }
function metaFooter(data, type) { const meta = type === "series" ? seriesMeta(data) : postMeta(data); return { tag: "footer", attr: { class: "nav-card-meta" }, children: meta.map(label => ({ tag: "span", children: [label] })) }; }
function seriesMeta(data) { return [unit(data.subSeriesCount, "sub-series", "sub-series"), unit(data.postCount, "post", "posts"), unit(data.followersCount, "follower", "followers")]; }
function postMeta(data) { return [unit(data.sectionsCount, "section", "sections"), unit(data.commentsCount, "comment", "comments")]; }
function unit(value, singular, plural) { return `${value} ${value === 1 ? singular : plural}`; }

async function toggleSeriesBranch(event, data, navigator, appState, kidsId, depth) {
    event.preventDefault(); event.stopPropagation();
    const button = event.currentTarget;
    const well = document.getElementById(kidsId);
    if (!well) return;
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(willOpen));
    well.hidden = !willOpen;
    if (!willOpen) return;
    if (expandedCache.has(data.id)) return renderBranchChildren(well, expandedCache.get(data.id), navigator, appState, depth + 1);
    well.replaceChildren(ScribeOfManifestation.speakElement({ tag: "div", attr: { class: "series-branch-loading" }, children: ["Opening branch..."] }));
    try {
        const children = normalizeCollection(await api.getSubSeriesDetails(appState.heichelId, data.id));
        expandedCache.set(data.id, children);
        renderBranchChildren(well, children, navigator, appState, depth + 1);
    } catch (error) {
        well.replaceChildren(ScribeOfManifestation.speakElement({ tag: "div", attr: { class: "series-branch-error" }, children: [`Could not open branch: ${error.message}`] }));
    }
}

function renderBranchChildren(well, children, navigator, appState, depth) {
    well.replaceChildren();
    if (!children.length) return well.appendChild(ScribeOfManifestation.speakElement({ tag: "div", attr: { class: "series-branch-empty" }, children: ["No deeper chambers here yet."] }));
    children.forEach(item => well.appendChild(ScribeOfManifestation.speakElement(cardBlueprint(item, "series", navigator, appState, depth))));
}

function cardMenuBlueprint(data, navigator, appState, sourceItem) {
    const socialItem = { ...sourceItem, ...data.raw, id: data.id, title: data.title };
    const socialActions = data.type === "post" ? socialActionBlueprints(socialItem, appState, closeAllMenus) : [];
    const sidebarAction = data.type === "post" ? sidebarCommentAction(data, appState) : null;
    const adminAction = appState.ownsIt ? adminMenuAction(data, navigator, appState) : null;
    const menuId = `card-menu-panel-${String(data.id).replace(/[^a-z0-9_-]/gi, "-")}`;
    return { tag: "div", attr: { class: "card-menu-spark", "data-card-menu": data.id }, events: { click: stopMenuLeak }, children: [trigger(menuId), { tag: "div", attr: { id: menuId, class: "card-menu-panel", role: "menu" }, events: { click: stopMenuLeak }, children: [bookmarkAction(data), sidebarAction, adminAction, ...socialActions].filter(Boolean) }] };
}
function trigger(menuId) { return { tag: "button", attr: { type: "button", class: "card-menu-trigger", "aria-label": "Open card menu", "aria-expanded": "false", "aria-controls": menuId }, children: ["⋮"], events: { click: toggleCardMenu } }; }
function bookmarkAction(data) { return { tag: "button", attr: { type: "button", class: "card-menu-action", role: "menuitem" }, children: ["Bookmark"], events: { click: event => { event.preventDefault(); event.stopPropagation(); saveBookmark(data); closeAllMenus(); notify("Bookmark saved.", "success"); } } }; }
function sidebarCommentAction(data, appState) { return { tag: "button", attr: { type: "button", class: "card-menu-action sidebar-comments-action", role: "menuitem" }, children: ["Show Comments"], events: { click: async event => { event.preventDefault(); event.stopPropagation(); closeAllMenus(); await renderSidebarComments({ heichelId: appState.heichelId, postId: data.id, title: data.title, seriesId: appState.currentSeries || "root" }); } } }; }
function adminMenuAction(data, navigator, appState) { return { tag: "button", attr: { type: "button", class: "card-menu-action admin-action", role: "menuitem" }, children: ["Manage"], events: { click: event => { event.preventDefault(); event.stopPropagation(); closeAllMenus(); showContextMenu(event.target, { id: data.id, type: data.type, parentId: appState.currentSeries, title: data.title, description: data.description || "" }, navigator); } } }; }
function saveBookmark(data) { const key = "BH_GELOOY_BOOKMARKS"; const current = JSON.parse(localStorage.getItem(key) || "[]"); current.unshift({ id: data.id, type: data.type, title: data.title, href: location.href, savedAt: Date.now() }); localStorage.setItem(key, JSON.stringify(current.slice(0, 120))); }
function toggleCardMenu(event) { event.preventDefault(); event.stopPropagation(); const menu = event.currentTarget.closest(".card-menu-spark"); if (!menu) return; const willOpen = !menu.classList.contains("open"); closeAllMenus(menu); menu.classList.toggle("open", willOpen); event.currentTarget.setAttribute("aria-expanded", willOpen ? "true" : "false"); }
function stopMenuLeak(event) { event.preventDefault(); event.stopPropagation(); }
function closeAllMenus(except = null) { document.querySelectorAll(".card-menu-spark.open").forEach(menu => { if (menu !== except) { menu.classList.remove("open"); menu.querySelector(".card-menu-trigger")?.setAttribute("aria-expanded", "false"); } }); }
function ensureGlobalMenuClosers() { if (globalMenuClosersInstalled) return; globalMenuClosersInstalled = true; document.addEventListener("pointerdown", event => { if (!event.target.closest(".card-menu-spark")) closeAllMenus(); }, true); document.addEventListener("keydown", event => { if (event.key === "Escape") closeAllMenus(); }, true); }
function handleCardSelectionOrNav(event, data, item, navigator, appState) { if (event.target.closest(".card-menu-spark, .series-expand-toggle")) return; if (appState.isSelectionMode) return import("../controls.js").then(module => module.toggleItemSelection({ id: data.id, type: data.type }, appState)); if (data.type === "series") navigator.navigateTo(data.id); else window.location.href = `/heichelos/${appState.heichelId}/series/${appState.currentSeries}/${item.indexInSeries !== undefined ? item.indexInSeries : data.id}`; }
