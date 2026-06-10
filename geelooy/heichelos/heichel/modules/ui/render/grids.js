// B"H
/**
 * @module MobileNavigationGrids
 * @description
 * Chapter 89: The Awtsmoos turns posts and series into scrollable mobile cards.
 * Series cards get thumbnail, badge, counts, bookmark, and chevron. Post cards
 * get title, excerpt, section/comment counts, and a clear reader door.
 */

import { DOMElements } from "../../dom.js";
import { ScribeOfManifestation } from "../../engine/scribe-of-manifestation.js";
import { showContextMenu } from "../contextmenu.js";
import { getItemKey } from "../../state.js";
import { socialActionBlueprints } from "./social-actions.js";
import { renderSidebarComments } from "../sidebar-comments.js";
import { normalizeCardData } from "./cardData.js";

let globalMenuClosersInstalled = false;

export function renderContentGrids(content, navigator, appState) {
    ensureGlobalMenuClosers();
    manifestSpecificGrid(content.posts, DOMElements.postsList, "post", navigator, appState);
    manifestSpecificGrid(content.subSeries, DOMElements.seriesList, "series", navigator, appState);
}

function manifestSpecificGrid(items, container, type, navigator, appState) {
    if (!container) return;
    container.replaceChildren();
    if (!items || items.length === 0) {
        container.appendChild(ScribeOfManifestation.speakElement(emptyBlueprint(type)));
        return;
    }
    items.forEach(item => container.appendChild(ScribeOfManifestation.speakElement(cardBlueprint(item, type, navigator, appState))));
}

function emptyBlueprint(type) {
    return { tag: "div", attr: { class: "empty-glow-msg" }, children: [`No ${type === "series" ? "series" : "posts"} here yet.`] };
}

function cardBlueprint(item, type, navigator, appState) {
    const data = normalizeCardData(item, type);
    const isSelected = appState.selectedItems.has(getItemKey({ id: data.id, type }));
    return {
        tag: "article",
        attr: { class: `nav-card ${type}-nav-card ${isSelected ? "selected" : ""}`, "data-id": data.id, "data-type": type },
        events: { click: event => handleCardSelectionOrNav(event, data, item, navigator, appState) },
        children: [cardMedia(data), cardBody(data, type), cardMenuBlueprint(data, navigator, appState, item)]
    };
}

function cardMedia(data) {
    return { tag: "div", attr: { class: "nav-card-media", style: data.thumbnail ? `background-image:url('${data.thumbnail}')` : "" }, children: [{ tag: "span", children: [data.type === "series" ? "S" : "P"] }] };
}

function cardBody(data, type) {
    const meta = type === "series"
        ? `${data.postCount} posts · ${data.followersCount} followers`
        : `${data.sectionsCount} sections · ${data.commentsCount} comments`;
    return {
        tag: "div",
        attr: { class: "nav-card-body" },
        children: [
            { tag: "div", attr: { class: "nav-card-title-row" }, children: [{ tag: "h2", children: [data.title] }, { tag: "span", attr: { class: "nav-card-chevron" }, children: ["›"] }] },
            { tag: "p", children: [data.description || (type === "series" ? "Open this series path." : "Open this reader post.")] },
            { tag: "footer", children: [meta] }
        ]
    };
}

function cardMenuBlueprint(data, navigator, appState, sourceItem) {
    const socialItem = { ...sourceItem, ...data.raw, id: data.id, title: data.title };
    const socialActions = data.type === "post" ? socialActionBlueprints(socialItem, appState) : [];
    const sidebarAction = data.type === "post" ? sidebarCommentAction(data, appState) : null;
    const adminAction = appState.ownsIt ? adminMenuAction(data, navigator, appState) : null;
    const menuId = `card-menu-panel-${String(data.id).replace(/[^a-z0-9_-]/gi, "-")}`;
    return { tag: "div", attr: { class: "card-menu-spark", "data-card-menu": data.id }, events: { click: stopMenuLeak }, children: [trigger(menuId), { tag: "div", attr: { id: menuId, class: "card-menu-panel", role: "menu" }, events: { click: stopMenuLeak }, children: [bookmarkAction(), sidebarAction, adminAction, ...socialActions].filter(Boolean) }] };
}

function trigger(menuId) {
    return { tag: "button", attr: { type: "button", class: "card-menu-trigger", "aria-label": "Open card menu", "aria-expanded": "false", "aria-controls": menuId }, children: ["⋮"], events: { click: toggleCardMenu } };
}

function bookmarkAction() {
    return { tag: "button", attr: { type: "button", class: "card-menu-action", role: "menuitem" }, children: ["Bookmark"] };
}

function sidebarCommentAction(data, appState) {
    return { tag: "button", attr: { type: "button", class: "card-menu-action sidebar-comments-action", role: "menuitem" }, children: ["Show Comments"], events: { click: async event => { event.preventDefault(); event.stopPropagation(); closeAllMenus(); await renderSidebarComments({ heichelId: appState.heichelId, postId: data.id, title: data.title, seriesId: appState.currentSeries || "root" }); } } };
}

function adminMenuAction(data, navigator, appState) {
    return { tag: "button", attr: { type: "button", class: "card-menu-action admin-action", role: "menuitem" }, children: ["Manage"], events: { click: event => { event.preventDefault(); event.stopPropagation(); closeAllMenus(); showContextMenu(event.target, { id: data.id, type: data.type, parentId: appState.currentSeries, title: data.title }, navigator); } } };
}

function toggleCardMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    const menu = event.currentTarget.closest(".card-menu-spark");
    if (!menu) return;
    const willOpen = !menu.classList.contains("open");
    closeAllMenus(menu);
    menu.classList.toggle("open", willOpen);
    event.currentTarget.setAttribute("aria-expanded", willOpen ? "true" : "false");
}

function stopMenuLeak(event) {
    event.preventDefault();
    event.stopPropagation();
}

function closeAllMenus(except = null) {
    document.querySelectorAll(".card-menu-spark.open").forEach(menu => {
        if (menu === except) return;
        menu.classList.remove("open");
        menu.querySelector(".card-menu-trigger")?.setAttribute("aria-expanded", "false");
    });
}

function ensureGlobalMenuClosers() {
    if (globalMenuClosersInstalled) return;
    globalMenuClosersInstalled = true;
    document.addEventListener("pointerdown", event => { if (!event.target.closest(".card-menu-spark")) closeAllMenus(); }, true);
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeAllMenus(); }, true);
}

function handleCardSelectionOrNav(event, data, item, navigator, appState) {
    if (event.target.closest(".card-menu-spark")) return;
    if (appState.isSelectionMode) {
        import("../controls.js").then(module => module.toggleItemSelection({ id: data.id, type: data.type }, appState));
        return;
    }
    if (data.type === "series") navigator.navigateTo(data.id);
    else window.location.href = `/heichelos/${appState.heichelId}/series/${appState.currentSeries}/${item.indexInSeries !== undefined ? item.indexInSeries : data.id}`;
}
