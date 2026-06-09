// B"H
/**
 * @module GridManifest
 * @description
 * Chapter 269: The card menu becomes a disciplined mobile gate.
 *
 * The active Heichel page uses this renderer, not the older logic folder. The
 * three-dot spark now opens only from its button, closes on outside/Escape, and
 * never lets menu clicks leak into card navigation. The card face remains calm;
 * the thunder waits inside the dot.
 */

import { DOMElements } from "../../dom.js";
import { ScribeOfManifestation } from "../../engine/scribe-of-manifestation.js";
import { showContextMenu } from "../contextmenu.js";
import { getItemKey } from "../../state.js";
import { socialActionBlueprints } from "./social-actions.js";
import { openRecordVessel } from "../../navigator/content-normalizer.js";
import { VoidPurifier } from "../../utils/VoidPurifier.js";

let globalMenuClosersInstalled = false;

function clean(value, fallback = "") {
    return VoidPurifier.purify(value) || fallback;
}

function previewText(data) {
    const raw = clean(data.content || data.description || "");
    return raw.substring(0, 150) + (raw.length >= 150 ? "..." : "");
}

function emptyBlueprint(type) {
    return {
        tag: "div",
        attr: { class: "empty-glow-msg" },
        children: [`The realm of ${type}s is currently silent.`]
    };
}

function ensureGlobalMenuClosers() {
    if (globalMenuClosersInstalled) return;
    globalMenuClosersInstalled = true;
    document.addEventListener("pointerdown", event => {
        if (event.target.closest(".card-menu-spark")) return;
        closeAllMenus();
    }, true);
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeAllMenus();
    }, true);
}

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
    items.forEach(item => container.appendChild(ScribeOfManifestation.speakElement(getCardBlueprint(item, type, navigator, appState))));
}

function getCardData(item, type) {
    const raw = openRecordVessel(type === "post" ? item : (item.prateem || item)) || {};
    const id = raw.id || raw.postId || raw.seriesId || raw.inputId || item.id || item.postId || item.seriesId;
    const title = clean(raw.title || raw.name || raw.id || id, "Hidden Insight");
    return { raw, id, title, desc: previewText(raw) };
}

function getCardBlueprint(item, type, navigator, appState) {
    const { raw, id, title, desc } = getCardData(item, type);
    const isSelected = appState.selectedItems.has(getItemKey({ id, type }));
    const socialItem = { ...item, ...raw, id, title };
    return {
        tag: "div",
        attr: {
            class: `card-wrapper awtsmoos-card ${isSelected ? "selected" : ""}`,
            "data-id": id,
            "data-type": type
        },
        events: { click: event => handleCardSelectionOrNav(event, { id, type, title, index: item.indexInSeries }, navigator, appState) },
        children: [
            cardMenuBlueprint(id, type, title, navigator, appState, socialItem),
            {
                tag: "div",
                attr: { class: `post-card ${type}` },
                children: [
                    { tag: "h2", children: [title] },
                    { tag: "p", children: [desc] }
                ]
            }
        ]
    };
}

function cardMenuBlueprint(id, type, title, navigator, appState, socialItem) {
    const socialActions = type === "post" ? socialActionBlueprints(socialItem, appState) : [];
    const adminAction = appState.ownsIt ? adminMenuAction(id, type, title, navigator, appState) : null;
    const menuId = `card-menu-panel-${String(id).replace(/[^a-z0-9_-]/gi, "-")}`;
    return {
        tag: "div",
        attr: { class: "card-menu-spark", "data-card-menu": id },
        events: { click: stopMenuLeak },
        children: [
            {
                tag: "button",
                attr: {
                    type: "button",
                    class: "card-menu-trigger",
                    "aria-label": "Open card menu",
                    "aria-expanded": "false",
                    "aria-controls": menuId
                },
                children: ["⋮"],
                events: { click: toggleCardMenu }
            },
            {
                tag: "div",
                attr: { id: menuId, class: "card-menu-panel", role: "menu" },
                events: { click: stopMenuLeak },
                children: [adminAction, ...socialActions].filter(Boolean)
            }
        ]
    };
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

function adminMenuAction(id, type, title, navigator, appState) {
    return {
        tag: "button",
        attr: { type: "button", class: "card-menu-action admin-action", role: "menuitem" },
        children: ["Manage"],
        events: {
            click: event => {
                event.preventDefault();
                event.stopPropagation();
                closeAllMenus();
                showContextMenu(event.target, { id, type, parentId: appState.currentSeries, title }, navigator);
            }
        }
    };
}

function closeAllMenus(except = null) {
    document.querySelectorAll(".card-menu-spark.open").forEach(menu => {
        if (menu === except) return;
        menu.classList.remove("open");
        menu.querySelector(".card-menu-trigger")?.setAttribute("aria-expanded", "false");
    });
}

function handleCardSelectionOrNav(event, item, navigator, appState) {
    if (event.target.closest(".card-menu-spark")) return;
    if (appState.isSelectionMode) {
        import("../controls.js").then(module => module.toggleItemSelection(item, appState));
        return;
    }
    if (item.type === "series") navigator.navigateTo(item.id);
    else window.location.href = `/heichelos/${appState.heichelId}/series/${appState.currentSeries}/${item.index !== undefined ? item.index : item.id}`;
}
