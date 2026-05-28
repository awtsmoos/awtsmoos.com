/**
 * B"H
 * @module GridManifest
 * @description
 * The grids organize posts and series into clean cards. The Awtsmoos gives each
 * card a purified title and preview before manifestation, so executable text is
 * swallowed before it reaches the visible library.
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
            appState.ownsIt ? cardMenuBlueprint(id, type, title, navigator, appState) : null,
            {
                tag: "div",
                attr: { class: `post-card ${type}` },
                children: [
                    { tag: "h2", children: [title] },
                    { tag: "p", children: [desc] },
                    ...(type === "post" ? socialActionBlueprints(socialItem, appState) : [])
                ]
            }
        ].filter(Boolean)
    };
}

function cardMenuBlueprint(id, type, title, navigator, appState) {
    return {
        tag: "div",
        attr: { class: "card-menu-spark" },
        children: ["⋮"],
        events: {
            click: event => {
                event.stopPropagation();
                showContextMenu(event.target, { id, type, parentId: appState.currentSeries, title }, navigator);
            }
        }
    };
}

function handleCardSelectionOrNav(event, item, navigator, appState) {
    if (appState.isSelectionMode) {
        import("../controls.js").then(module => module.toggleItemSelection(item, appState));
        return;
    }
    if (item.type === "series") navigator.navigateTo(item.id);
    else window.location.href = `/heichelos/${appState.heichelId}/series/${appState.currentSeries}/${item.index !== undefined ? item.index : item.id}`;
}
