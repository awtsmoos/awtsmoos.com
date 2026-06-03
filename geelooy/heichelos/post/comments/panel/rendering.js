// B"H
/**
 * @module SidebarRenderingScribe
 * @description
 * Chapter 75: The Awtsmoos abolishes the horizontal court.
 *
 * The Commentators chamber is now one page: a searchable Students list with
 * focused actions. Comments and favorites are not rendered beside it as hidden
 * columns. When a student opens, the TabManager creates a real new chamber,
 * which is the correct mobile pattern: one room, one scroll, one direction.
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

function placeholder(text) {
    return manifest({ tag: "div", attr: { class: "loading-ink awtsmoos-empty-placeholder" }, children: [text] });
}

function makeSearch() {
    return manifest({ tag: "div", attr: { class: "awtsmoos-sidebar-search" }, children: [
        { tag: "input", attr: { class: "awtsmoos-sidebar-search-input", type: "search", placeholder: "Search students…", autocomplete: "off" } },
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

function makeStudentsPage(count) {
    return manifest({ tag: "section", attr: { class: "awtsmoos-ideal-sidebar awtsmoos-students-page" }, children: [
        { tag: "header", attr: { class: "awtsmoos-section-title-row" }, children: [
            { tag: "h3", children: ["Students"] },
            { tag: "span", attr: { class: "awtsmoos-count-pill" }, children: [String(count)] }
        ] }
    ] });
}

export async function makeCommentatorList(actualTab, forceFresh = false) {
    actualTab.innerHTML = "";
    actualTab.appendChild(placeholder("Gathering commentators…"));
    await nextFrame();
    const aliases = await getAndSaveAliases(false, forceFresh, null, undefined, false);
    const page = makeStudentsPage(aliases?.length || 0);
    const keepersWrap = document.createElement("div");
    keepersWrap.className = "keepers-assembly awtsmoos-students-list";
    page.append(makeSearch(), makeAiRow(), keepersWrap, actionRows(keepersWrap));
    actualTab.innerHTML = "";
    actualTab.appendChild(page);
    bindSearch(page);
    if (!aliases?.length) {
        keepersWrap.appendChild(placeholder("The chambers are currently silent."));
        return;
    }
    await renderChunked(aliases, alias => {
        const row = createKeeperRow(alias, triggerAliasTab);
        row.dataset.awtsmoosSearchText = String(alias).toLowerCase();
        return row;
    }, keepersWrap, 10);
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
    tab.appendChild(placeholder(`Opening @${alias} smoothly…`));
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
