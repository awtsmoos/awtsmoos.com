// B"H
/**
 * @module BookmarksPanel
 * @description
 * Chapter 5: The bookmark map is purified. No raw HTML enters this chamber;
 * every title and preview becomes textContent, safe as a measured vessel.
 */

import { updateQueryStringParameter } from "../../functions/utils.js";

function makeEmptyMessage() {
    const empty = document.createElement("div");
    empty.className = "awtsmoos-empty-placeholder";
    empty.append("No bookmarks saved yet.", document.createElement("br"), "Click 'B' next to any verse.");
    return empty;
}

function makeTextNode(className, text) {
    const node = document.createElement("div");
    node.className = className;
    node.textContent = text || "";
    return node;
}

/**
 * Manifests the saved bookmarks in the sidebar.
 * @param {Element} tab Sidebar tab body.
 */
export async function renderBookmarksPanel(tab) {
    if (!tab) return;
    tab.replaceChildren();
    const bookmarks = JSON.parse(localStorage.getItem("awtsmoos-bookmarks") || "[]");
    if (bookmarks.length === 0) {
        tab.appendChild(makeEmptyMessage());
        return;
    }
    const list = document.createElement("ul");
    list.className = "bookmarks-list";
    bookmarks.forEach((bm, index) => list.appendChild(makeBookmarkRow(bm, index, bookmarks, tab)));
    tab.appendChild(list);
}

function makeBookmarkRow(bm, index, bookmarks, tab) {
    const li = document.createElement("li");
    li.className = "awtsmoos-bookmark-row awtsmoos-list-item";
    li.append(makeTextNode("awtsmoos-bookmark-title", bm.title));
    li.append(makeTextNode("awtsmoos-bookmark-preview", bm.textPreview));

    const del = document.createElement("button");
    del.textContent = "×";
    del.className = "bookmark-delete-btn";
    del.onclick = event => {
        event.stopPropagation();
        bookmarks.splice(index, 1);
        localStorage.setItem("awtsmoos-bookmarks", JSON.stringify(bookmarks));
        renderBookmarksPanel(tab);
    };
    li.appendChild(del);
    li.onclick = () => {
        updateQueryStringParameter("idx", bm.idx);
        updateQueryStringParameter("sub", bm.sub || null);
        window.location.reload();
    };
    return li;
}
