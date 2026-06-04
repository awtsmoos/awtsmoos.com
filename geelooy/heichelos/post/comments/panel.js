/**
 * B"H
 * @module SidebarCommentPanel
 * @description
 * Chapter 213: The sidebar uses one fresh fetch path and exposes refresh hooks.
 * All alias tabs, root lists, and post-wide views now come from the new direct
 * API reader in panel/fetching.js. New comments and replies can refresh without
 * forcing the reader to click Refresh Comments.
 */

import { getCurrentVerse, getCurrentSub } from "./state.js";
import { getAndSaveAliases as fetchAliases, fetchRelevantComments, clearSidebarCommentCache } from "./panel/fetching.js";
import { makeCommentatorList as renderCommentatorList, renderControlsAndComments } from "./panel/rendering.js";
import { nextFrame } from "./panel/performance/SmoothScheduler.js";

export { getAndSaveAliases } from "./panel/fetching.js";

function ensureAliasRegistry() {
    if (!window.__awtsmoosAliasTabs) window.__awtsmoosAliasTabs = new Map();
    return window.__awtsmoosAliasTabs;
}

function emptyMessage(alias, all, cs) {
    if (all) return `No comments from @${alias} on this scroll.`;
    return `No comments from @${alias} on ${cs !== null && cs !== undefined ? "this paragraph" : "this verse"}.`;
}

export async function loadRootComments({ parent, tab }) {
    window.tabComment = tab;
    window.tabParent = parent;
    window.rootLevelCommentatorTab = tab;
    tab.actual = parent;
    tab.awtsmoosType = "main commentator list";
    parent.innerHTML = "";
    await updateCommentHeader();
    await makeCommentatorList(parent, false);
}

export async function makeCommentatorList(actualTab, forceFresh = false) {
    return await renderCommentatorList(actualTab, forceFresh);
}

export async function updateCommentHeader() {
    const search = new URLSearchParams(location.search);
    const sub = search.get("sub");
    const aliases = await fetchAliases(false, false, null, undefined);
    const cv = getCurrentVerse();
    const curVerseDisplay = cv === "root" ? "Post" : +cv + 1;
    let headerText = `${aliases.length} Commentators (Verse ${curVerseDisplay})`;
    if (sub !== null && sub !== "null") headerText = `${aliases.length} Commentators (Verse ${curVerseDisplay}, Para ${+sub + 1})`;
    if (window.tabComment?.onUpdateHeader) window.tabComment.onUpdateHeader(headerText);
}

export async function showAllComments({ alias, post, tab, all = false, forceFresh = false }) {
    const cv = all ? "all" : getCurrentVerse();
    const cs = all ? undefined : getCurrentSub();
    const coms = await fetchRelevantComments(alias, cv, cs, forceFresh);
    if (!Array.isArray(coms) || coms.length === 0) {
        tab.innerHTML = `<div class="awtsmoos-empty-placeholder">${emptyMessage(alias, all, cs)}</div>`;
        return;
    }
    await renderControlsAndComments(coms, alias, tab);
}

export async function openCommentsPanelToAlias(alias, open = true, searchAll = false) {
    if (open && window.toggleSidebar) window.toggleSidebar(true);
    const registry = ensureAliasRegistry();
    const key = searchAll ? `${alias}:all` : alias;
    const existing = registry.get(key);
    if (existing?.open) {
        await existing.open();
        return existing.actual;
    }
    return new Promise(resolve => {
        const tabObj = window.tabManager.addTab({
            header: "@" + alias,
            name: `user-${alias}${searchAll ? "-all" : ""}`,
            content: `<div class="loading-ink awtsmoos-empty-placeholder">B"H Opening @${alias}...</div>`,
            async onopen({ actualTab, tab }) {
                tab.awtsmoosType = "specific alias comments";
                tabObj.actual = actualTab;
                window.currentAliasTabContainer = actualTab;
                window.currentAliasBeingViewed = alias;
                actualTab.innerHTML = `<div class="loading-ink awtsmoos-empty-placeholder">B"H Opening @${alias} smoothly...</div>`;
                await nextFrame();
                await openCommentsOfAlias({ alias, actualTab, post: window.post, all: searchAll });
                resolve(actualTab);
            }
        });
        registry.set(key, tabObj);
        tabObj.open();
    });
}

export async function openCommentsOfAlias({ alias, actualTab, post, all = false, forceFresh = false }) {
    await showAllComments({ tab: actualTab, post, alias, all, forceFresh });
}

export async function refreshSidebarComments() {
    clearSidebarCommentCache();
    if (window.rootLevelCommentatorTab?.actual) await makeCommentatorList(window.rootLevelCommentatorTab.actual, true);
    if (window.currentAliasTabContainer && window.currentAliasBeingViewed) {
        await openCommentsOfAlias({ alias: window.currentAliasBeingViewed, actualTab: window.currentAliasTabContainer, post: window.post, forceFresh: true });
    }
}

window.openCommentsPanelToAlias = openCommentsPanelToAlias;
window.openCommentsOfAlias = openCommentsOfAlias;
window.makeCommentatorList = makeCommentatorList;
window.refreshSidebarComments = refreshSidebarComments;
