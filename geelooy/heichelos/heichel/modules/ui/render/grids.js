/**
 * B"H
 * @module GridManifest
 * @description
 * Chapter 2: The Awtsmoos folds the noisy market into one silent dot.
 *
 * The grids organize posts and series into clean cards. Post social actions
 * are hidden inside the three-dot menu so the card face remains readable on
 * mobile and desktop. The menu is click-safe: opening the menu does not open
 * the post, and social buttons do not bubble into navigation.
 */

import { DOMElements } from "../../dom.js";
import { ScribeOfManifestation } from "../../engine/scribe-of-manifestation.js";
import { showContextMenu } from "../contextmenu.js";
import { getItemKey } from "../../state.js";
import { socialActionBlueprints } from "./social-actions.js";
import { openRecordVessel } from "../../navigator/content-normalizer.js";
import { VoidPurifier } from "../../utils/VoidPurifier.js";

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

export function renderContentGrids(content, navigator, appState) {
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
    return {
        tag: "div",
        attr: { class: "card-menu-spark", "data-card-menu": id },
        children: [
            { tag: "button", attr: { type: "button", class: "card-menu-trigger", "aria-label": "Open card menu" }, children: ["⋮"] },
            {
                tag: "div",
                attr: { class: "card-menu-panel", role: "menu" },
                children: [adminAction, ...socialActions].filter(Boolean)
            }
        ],
        events: {
            click: event => {
                event.preventDefault();
                event.stopPropagation();
                closeOtherMenus(event.currentTarget);
                event.currentTarget.classList.toggle("open");
            }
        }
    };
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
                showContextMenu(event.target, { id, type, parentId: appState.currentSeries, title }, navigator);
            }
        }
    };
}

function closeOtherMenus(activeMenu) {
    document.querySelectorAll(".card-menu-spark.open").forEach(menu => {
        if (menu !== activeMenu) menu.classList.remove("open");
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
