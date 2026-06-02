// B"H
/**
 * @module SidebarRenderingScribe
 * @description
 * Chapter 71: The Awtsmoos seals the chamber law. Comments, students, and
 * favorites may all exist in memory, but only one may wear the visible crown.
 * The CSS receives `is-current-panel`, the DOM receives `hidden`, and the user
 * receives one clean surface instead of colliding worlds.
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

function manifest(blueprint) { return BlueprintManifestor.manifest(blueprint); }

function loadingNode(text) {
    return manifest({ tag: "div", attr: { class: "loading-ink awtsmoos-smooth-loading awtsmoos-empty-placeholder" }, children: [text] });
}

function setActivePanel(shell, name) {
    shell.querySelectorAll(".awtsmoos-sidebar-tab-btn").forEach(btn => {
        const active = btn.dataset.panel === name;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
    });
    shell.querySelectorAll(".awtsmoos-sidebar-panel").forEach(panel => {
        const active = panel.dataset.panel === name;
        panel.hidden = !active;
        panel.classList.toggle("is-current-panel", active);
        panel.setAttribute("aria-hidden", String(!active));
    });
}

function makeTabs(counts) {
    return { tag: "nav", attr: { class: "awtsmoos-sidebar-tabs", "aria-label": "Comment panels" }, children: [
        tabBlueprint("comments", "Comments", counts.comments, false),
        tabBlueprint("students", "Students", counts.students, true),
        tabBlueprint("favorites", "Favorites", counts.favorites, false)
    ] };
}

function tabBlueprint(panel, label, count, active) {
    return {
        tag: "button",
        attr: { class: `awtsmoos-sidebar-tab-btn ${active ? "is-active" : ""}`, type: "button", "data-panel": panel, "aria-selected": String(active) },
        children: [{ tag: "span", children: [label] }, { tag: "strong", children: [String(count)] }]
    };
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
            node.hidden = !!term && !(node.dataset.awtsmoosSearchText || "").includes(term);
        });
    }, { passive: true });
}

function makeAiRow() {
    return manifest({ tag: "button", attr: { class: "awtsmoos-list-item ai-monolith awtsmoos-action-row", type: "button" }, children: [
        { tag: "span", attr: { class: "keeper-icon awtsmoos-student-avatar" }, children: ["✨"] },
        { tag: "span", attr: { class: "keeper-name awtsmoos-student-name" }, children: ["Ask Awtsmoos AI"] },
        { tag: "span", attr: { class: "keeper-arrow awtsmoos-student-location" }, children: ["→"] }
    ], events: { click: async () => {
        const { openAIChat } = await import("../../ai/chat.js");
        openAIChat();
    } } });
}

function actionRows(keepersWrap) {
    return manifest({ tag: "section", attr: { class: "awtsmoos-sidebar-actions" }, children: [
        { tag: "h4", children: ["Actions"] },
        { tag: "button", attr: { class: "awtsmoos-action-row", type: "button" }, children: ["👥 Open All Students"], events: { click: () => keepersWrap.querySelectorAll(".keeper-portal-trigger").forEach(btn => btn.click()) } },
        { tag: "button", attr: { class: "awtsmoos-action-row", type: "button" }, children: ["↻ Refresh Comments"], events: { click: () => window.location.reload() } },
        { tag: "button", attr: { class: "awtsmoos-action-row", type: "button" }, children: ["✨ Ask Awtsmoos AI"], events: { click: async () => {
            const { openAIChat } = await import("../../ai/chat.js");
            openAIChat();
        } } }
    ] });
}

function makeShell(counts) {
    return manifest({ tag: "div", attr: { class: "awtsmoos-ideal-sidebar" }, children: [
        makeTabs(counts),
        { tag: "div", attr: { class: "awtsmoos-sidebar-panels" }, children: [
            { tag: "section", attr: { class: "awtsmoos-sidebar-panel", "data-panel": "comments", hidden: true, "aria-hidden": "true" } },
            { tag: "section", attr: { class: "awtsmoos-sidebar-panel is-current-panel", "data-panel": "students", "aria-hidden": "false" } },
            { tag: "section", attr: { class: "awtsmoos-sidebar-panel", "data-panel": "favorites", hidden: true, "aria-hidden": "true" } }
        ] }
    ] });
}

function connectTabs(shell) {
    shell.querySelectorAll(".awtsmoos-sidebar-tab-btn").forEach(button => button.addEventListener("click", () => setActivePanel(shell, button.dataset.panel)));
}

function setupStudentsPanel(shell, aliases) {
    const panel = shell.querySelector('[data-panel="students"]');
    const keepersWrap = document.createElement("div");
    keepersWrap.className = "keepers-assembly awtsmoos-students-list";
    panel.append(makeSearch(), makeAiRow(), keepersWrap, actionRows(keepersWrap));
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

function setupCommentsPanel(shell) {
    const panel = shell.querySelector('[data-panel="comments"]');
    panel.append(loadingNode("Choose a student to read comments."));
    makeAddCommentSection(panel);
}

function setupFavoritesPanel(shell) {
    shell.querySelector('[data-panel="favorites"]').innerHTML = `<div class="awtsmoos-empty-placeholder">Favorite stars will gather here.</div>`;
}

export async function makeCommentatorList(actualTab, forceFresh = false) {
    actualTab.innerHTML = "";
    actualTab.appendChild(loadingNode("Gathering commentators…"));
    await nextFrame();
    const aliases = await getAndSaveAliases(false, forceFresh, null, undefined, false);
    const shell = makeShell({ comments: 0, students: aliases?.length || 0, favorites: 0 });
    actualTab.innerHTML = "";
    actualTab.appendChild(shell);
    connectTabs(shell);
    setupCommentsPanel(shell);
    setupFavoritesPanel(shell);
    await setupStudentsPanel(shell, aliases || []);
    setActivePanel(shell, "students");
}

function triggerAliasTab(alias) {
    const existing = window.__awtsmoosAliasTabs?.get(alias);
    if (existing?.open) return existing.open();
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

export async function renderControlsAndComments(coms, alias, tab) {
    tab.innerHTML = "";
    tab.appendChild(loadingNode(`Opening @${alias} smoothly…`));
    await nextFrame();
    const listContainer = document.createElement("div");
    listContainer.className = "sidebar-comment-list awtsmoos-comments-timeline";
    tab.innerHTML = "";
    tab.appendChild(listContainer);
    await renderChunked(buildCommentTree(coms), node => {
        const holder = document.createElement("div");
        renderTreeItem(node, holder, c => makeHTMLFromComment(c), "sidebar");
        const item = holder.firstElementChild;
        if (item) item.dataset.awtsmoosSearchText = item.textContent.toLowerCase();
        return item;
    }, listContainer, 5);
}
