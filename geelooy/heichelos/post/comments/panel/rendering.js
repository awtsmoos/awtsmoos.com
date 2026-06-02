
/**
 * B"H
 * @module SidebarRenderingScribe
 * @description
 * Chapter 25: The sidebar becomes the ideal dark chamber: tabs, search, student
 * rows, comment list, favorites placeholder, and actions. The Awtsmoos keeps the
 * opening fast by rendering in chunks and hiding sections instead of rebuilding
 * every breath.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { openCommentsOfAlias } from "../panel.js";
import { getAndSaveAliases } from "./fetching.js";
import { buildCommentTree } from "../logic/treeBuilder.js";
import { renderTreeItem } from "../render/tree.js";
import { makeHTMLFromComment } from "../render/core.js";
import { makeAddCommentSection } from "./rendering/AltarFactory.js";
import { createKeeperRow } from "./rendering/KeeperRowFactory.js";
import { nextFrame, renderChunked } from "./performance/SmoothScheduler.js";

export { makeAddCommentSection };

function manifest(blueprint) {
    return BlueprintManifestor.manifest(blueprint);
}

function loadingNode(text) {
    return manifest({ tag: "div", attr: { class: "loading-ink awtsmoos-smooth-loading awtsmoos-empty-placeholder" }, children: [text] });
}

function setActivePanel(shell, name) {
    shell.querySelectorAll(".awtsmoos-sidebar-tab-btn").forEach(btn => btn.classList.toggle("is-active", btn.dataset.panel === name));
    shell.querySelectorAll(".awtsmoos-sidebar-panel").forEach(panel => panel.hidden = panel.dataset.panel !== name);
}

function makeTabs(counts) {
    const tabs = [
        ["comments", "Comments", counts.comments],
        ["students", "Students", counts.students],
        ["favorites", "Favorites", counts.favorites]
    ];
    return { tag: "nav", attr: { class: "awtsmoos-sidebar-tabs", "aria-label": "Comment panels" }, children: tabs.map(([panel, label, count]) => ({
        tag: "button",
        attr: { class: `awtsmoos-sidebar-tab-btn ${panel === "students" ? "is-active" : ""}`, type: "button", "data-panel": panel },
        children: [{ tag: "span", children: [label] }, { tag: "strong", children: [String(count)] }]
    })) };
}

function makeSearch() {
    return manifest({ tag: "div", attr: { class: "awtsmoos-sidebar-search" }, children: [
        { tag: "input", attr: { class: "awtsmoos-sidebar-search-input", type: "search", placeholder: "Search comments or students…", autocomplete: "off" } },
        { tag: "button", attr: { class: "awtsmoos-sidebar-filter-btn", type: "button", title: "Filter" }, children: ["☰"] }
    ] });
}

function bindSearch(shell) {
    const input = shell.querySelector(".awtsmoos-sidebar-search-input");
    if (!input) return;
    input.addEventListener("input", () => {
        const term = input.value.trim().toLowerCase();
        shell.querySelectorAll("[data-awtsmoos-search-text]").forEach(node => {
            const text = node.dataset.awtsmoosSearchText || "";
            node.hidden = term && !text.includes(term);
        });
    }, { passive: true });
}

function makeAiRow() {
    return manifest({
        tag: "button",
        attr: { class: "awtsmoos-list-item ai-monolith awtsmoos-action-row", type: "button" },
        children: [
            { tag: "span", attr: { class: "keeper-icon awtsmoos-student-avatar" }, children: ["✨"] },
            { tag: "span", attr: { class: "keeper-name awtsmoos-student-name" }, children: ["Ask Awtsmoos AI"] },
            { tag: "span", attr: { class: "keeper-arrow awtsmoos-student-location" }, children: ["→"] }
        ],
        events: { click: async () => {
            const { openAIChat } = await import("../../ai/chat.js");
            openAIChat();
        } }
    });
}

function actionRows(keepersWrap) {
    return manifest({ tag: "section", attr: { class: "awtsmoos-sidebar-actions" }, children: [
        { tag: "h4", children: ["Actions"] },
        { tag: "button", attr: { class: "awtsmoos-action-row", type: "button" }, children: ["👥", "Open All Students"], events: { click: () => keepersWrap.querySelectorAll(".keeper-portal-trigger").forEach(btn => btn.click()) } },
        { tag: "button", attr: { class: "awtsmoos-action-row", type: "button" }, children: ["↻", "Refresh Comments"], events: { click: () => window.location.reload() } },
        { tag: "button", attr: { class: "awtsmoos-action-row", type: "button" }, children: ["✨", "Ask Awtsmoos AI"], events: { click: async () => {
            const { openAIChat } = await import("../../ai/chat.js");
            openAIChat();
        } } }
    ] });
}

function makeShell(counts) {
    return manifest({ tag: "div", attr: { class: "awtsmoos-ideal-sidebar" }, children: [
        makeTabs(counts),
        { tag: "div", attr: { class: "awtsmoos-sidebar-panels awtsmoos-ideal-sidebar" }, children: [
            { tag: "section", attr: { class: "awtsmoos-sidebar-panel", "data-panel": "comments", hidden: "" } },
            { tag: "section", attr: { class: "awtsmoos-sidebar-panel", "data-panel": "students" } },
            { tag: "section", attr: { class: "awtsmoos-sidebar-panel", "data-panel": "favorites", hidden: "" } }
        ] }
    ] });
}

function connectTabs(shell) {
    shell.querySelectorAll(".awtsmoos-sidebar-tab-btn").forEach(button => {
        button.addEventListener("click", () => setActivePanel(shell, button.dataset.panel));
    });
}

function setupStudentsPanel(shell, aliases, actualTab) {
    const panel = shell.querySelector('[data-panel="students"]');
    const search = makeSearch();
    const keepersWrap = document.createElement("div");
    keepersWrap.className = "keepers-assembly awtsmoos-students-list";
    panel.append(search, makeAiRow(), keepersWrap, actionRows(keepersWrap));
    bindSearch(shell);
    if (!aliases.length) {
        keepersWrap.innerHTML = `<div class="assembly-void-msg awtsmoos-empty-placeholder">The chambers are currently silent.</div>`;
        return Promise.resolve();
    }
    return renderChunked(aliases, alias => {
        const row = createKeeperRow(alias, triggerAliasTab);
        row.dataset.awtsmoosSearchText = String(alias).toLowerCase();
        return row;
    }, keepersWrap, 10);
}

function setupCommentsPanel(shell, actualTab) {
    const panel = shell.querySelector('[data-panel="comments"]');
    panel.appendChild(loadingNode("Choose a student to read comments."));
    makeAddCommentSection(panel);
}

function setupFavoritesPanel(shell) {
    const panel = shell.querySelector('[data-panel="favorites"]');
    panel.innerHTML = `<div class="awtsmoos-empty-placeholder">Favorite stars will gather here.</div>`;
}

/**
 * Manifests the Council of Keepers without blocking one frame.
 * @param {Element} actualTab Sidebar tab body.
 * @param {boolean} [forceFresh=false] Whether to bypass cache.
 */
export async function makeCommentatorList(actualTab, forceFresh = false) {
    actualTab.innerHTML = "";
    actualTab.appendChild(loadingNode("Gathering commentators…"));
    await nextFrame();

    const aliases = await getAndSaveAliases(false, forceFresh, null, undefined, false);
    const shell = makeShell({ comments: 0, students: aliases?.length || 0, favorites: 0 });
    actualTab.innerHTML = "";
    actualTab.appendChild(shell);
    connectTabs(shell);
    setupCommentsPanel(shell, actualTab);
    setupFavoritesPanel(shell);
    await setupStudentsPanel(shell, aliases || [], actualTab);
    setActivePanel(shell, "students");
}

function triggerAliasTab(alias) {
    const existing = window.__awtsmoosAliasTabs?.get(alias);
    if (existing?.open) {
        existing.open();
        return;
    }

    const tabObj = window.tabManager.addTab({
        header: "@" + alias,
        name: "user-" + alias,
        content: `<div class="loading-ink awtsmoos-empty-placeholder">Seeking records of @${alias}...</div>`,
        async onopen({ actualTab, tab }) {
            tab.awtsmoosType = "specific alias comments";
            window.currentAliasTabContainer = actualTab;
            window.currentAliasBeingViewed = alias;
            await nextFrame();
            await openCommentsOfAlias({ alias, actualTab, post: window.post });
        }
    });

    if (!window.__awtsmoosAliasTabs) window.__awtsmoosAliasTabs = new Map();
    window.__awtsmoosAliasTabs.set(alias, tabObj);
    tabObj.open();
}

/**
 * Pours a specific Guardian's comments into the timeline view in chunks.
 * @param {object[]} coms Comments.
 * @param {string} alias Alias id.
 * @param {Element} tab Sidebar body.
 */
export async function renderControlsAndComments(coms, alias, tab) {
    tab.innerHTML = "";
    tab.appendChild(loadingNode(`Opening @${alias} smoothly…`));
    await nextFrame();

    const treeRoots = buildCommentTree(coms);
    const listContainer = document.createElement("div");
    listContainer.className = "sidebar-comment-list awtsmoos-comments-timeline";
    tab.innerHTML = "";
    tab.appendChild(listContainer);
    await renderChunked(treeRoots, node => {
        const holder = document.createElement("div");
        renderTreeItem(node, holder, c => makeHTMLFromComment(c), "sidebar");
        const item = holder.firstElementChild;
        if (item) item.dataset.awtsmoosSearchText = item.textContent.toLowerCase();
        return item;
    }, listContainer, 5);
}
