// B"H
/**
 * @module SidebarRenderingScribe
 * @description
 * Chapter 180: The students page receives a human scribe altar and clear
 * navigation. AI is hidden for now. Root comments and all-scroll exploration
 * become first-class doors instead of cramped floating extras.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { CommentSection } from "../../CommentSection.js";
import { openCommentsOfAlias } from "../panel.js";
import { getAndSaveAliases } from "./fetching.js";
import { buildCommentTree } from "../logic/treeBuilder.js";
import { renderTreeItem } from "../render/tree.js";
import { makeHTMLFromComment } from "../render/core.js";
import { createKeeperRow } from "./rendering/KeeperRowFactory.js";
import { nextFrame, renderChunked } from "./performance/SmoothScheduler.js";

function manifest(blueprint) { return BlueprintManifestor.manifest(blueprint); }
function placeholder(text) { return manifest({ tag: "div", attr: { class: "loading-ink awtsmoos-empty-placeholder" }, children: [text] }); }

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

function makeScribeAltar() {
    const section = manifest({ tag: "section", attr: { class: "awtsmoos-sidebar-scribe-card" }, children: [
        { tag: "div", attr: { class: "awtsmoos-sidebar-scribe-head" }, children: [
            { tag: "span", attr: { class: "awtsmoos-detail-svg awtsmoos-detail-svg-scroll" }, children: [{ tag: "span" }] },
            { tag: "div", children: [{ tag: "h3", children: ["Write an Insight"] }, { tag: "p", children: ["Rich text, markdown, title, sections, root or current place."] }] }
        ] },
        { tag: "div", attr: { class: "awtsmoos-sidebar-scribe-mount" } }
    ] });
    new CommentSection(section.querySelector(".awtsmoos-sidebar-scribe-mount"), { compact: true, label: "✍️ Address your own comment" });
    return section;
}

function actionRows(keepersWrap) {
    return manifest({ tag: "section", attr: { class: "awtsmoos-sidebar-actions" }, children: [
        { tag: "h4", children: ["Comment Navigation"] },
        { tag: "button", attr: { class: "awtsmoos-action-row", type: "button" }, children: ["Root Comments"], events: { click: () => openRootCommentList() } },
        { tag: "button", attr: { class: "awtsmoos-action-row", type: "button" }, children: ["All Commented Students"], events: { click: () => keepersWrap.querySelectorAll(".keeper-portal-trigger").forEach(btn => btn.click()) } },
        { tag: "button", attr: { class: "awtsmoos-action-row", type: "button" }, children: ["Refresh Comments"], events: { click: () => window.location.reload() } }
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
    page.append(makeScribeAltar(), makeSearch(), keepersWrap, actionRows(keepersWrap));
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

async function openRootCommentList() {
    const aliases = await getAndSaveAliases(false, true, "root", undefined, false);
    const tabObj = window.tabManager.addTab({
        header: "Root Comments",
        name: "root-comments",
        content: `<div class="loading-ink awtsmoos-empty-placeholder">Gathering root comments...</div>`,
        async onopen({ actualTab }) {
            actualTab.innerHTML = "";
            if (!aliases.length) {
                actualTab.appendChild(placeholder("No root comments yet. Use the scribe altar and choose Root."));
                return;
            }
            const wrap = document.createElement("div");
            wrap.className = "keepers-assembly awtsmoos-students-list";
            actualTab.appendChild(wrap);
            aliases.forEach(alias => wrap.appendChild(createKeeperRow(alias, () => triggerAliasTab(alias, true))));
        }
    });
    tabObj.open();
}

function triggerAliasTab(alias, all = false) {
    const existing = window.__awtsmoosAliasTabs?.get(alias);
    if (existing?.open && !all) return existing.open();
    const tabObj = window.tabManager.addTab({
        header: "@" + alias,
        name: `user-${alias}${all ? "-all" : ""}`,
        content: `<div class="loading-ink awtsmoos-empty-placeholder">Seeking records of @${alias}...</div>`,
        async onopen({ actualTab, tab }) {
            tab.awtsmoosType = "specific alias comments";
            window.currentAliasTabContainer = actualTab;
            window.currentAliasBeingViewed = alias;
            await nextFrame();
            await openCommentsOfAlias({ alias, actualTab, post: window.post, all });
        }
    });
    if (!window.__awtsmoosAliasTabs) window.__awtsmoosAliasTabs = new Map();
    if (!all) window.__awtsmoosAliasTabs.set(alias, tabObj);
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
