
/**
 * B"H
 * @module SidebarCommentPanel
 * @chapter Deep-Dive into Aliases
 * @description
 * Chapter 16: The Awtsmoos opens each student chamber without stutter. Existing
 * alias tabs are reused, loading appears before heavy work, and rendering yields
 * back to the browser between breaths.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { getCurrentVerse, getCurrentSub } from "./state.js";
import { getAndSaveAliases as fetchAliases, fetchRelevantComments } from "./panel/fetching.js";
import { makeCommentatorList as renderCommentatorList, renderControlsAndComments } from "./panel/rendering.js";
import { unrollApiResponse } from "./logic/unroller.js";
import { nextFrame } from "./panel/performance/SmoothScheduler.js";

export { getAndSaveAliases } from "./panel/fetching.js";

function ensureAliasRegistry() {
    if (!window.__awtsmoosAliasTabs) window.__awtsmoosAliasTabs = new Map();
    return window.__awtsmoosAliasTabs;
}

export async function loadRootComments({ parent, tab }) {
    window.tabComment = tab;
    window.tabParent = parent;
    window.rootLevelCommentatorTab = tab;
    tab.awtsmoosType = "main commentator list";
    parent.innerHTML = "";
    await updateCommentHeader();
    await makeCommentatorList(parent, false);
}

export async function makeCommentatorList(actualTab, forceFresh = false) {
    return await renderCommentatorList(actualTab, forceFresh);
}

export async function updateCommentHeader() {
    const s = new URLSearchParams(location.search);
    const sub = s.get("sub");
    const aliases = await fetchAliases(false, false, null, undefined, false);
    const cv = getCurrentVerse();
    const curVerseDisplay = cv === "root" ? "Post" : +cv + 1;
    let headerText = `${aliases.length} Commentators (Verse ${curVerseDisplay})`;
    if (sub !== null && sub !== "null") headerText = `${aliases.length} Commentators (Verse ${curVerseDisplay}, Para ${+sub + 1})`;
    if (window.tabComment?.onUpdateHeader) window.tabComment.onUpdateHeader(headerText);
}

export async function showAllComments({ alias, post, tab, all = false }) {
    const cv = getCurrentVerse();
    const cs = getCurrentSub();
    let coms;
    if (all) {
        const result = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId,
            postId: post.id,
            heichelId: post.heichel.id,
            aliasId: alias,
            fromCache: false,
            get: { all: true }
        });
        coms = unrollApiResponse(result);
    } else {
        coms = await fetchRelevantComments(alias, cv, cs);
    }

    if (!Array.isArray(coms) || coms.length === 0) {
        const contextMsg = cs !== null && cs !== undefined ? "this paragraph" : "this verse";
        tab.innerHTML = `<div class="awtsmoos-empty-placeholder">No comments from @${alias} on ${contextMsg}.</div>`;
        return;
    }
    await renderControlsAndComments(coms, alias, tab);
}

export async function openCommentsPanelToAlias(alias, open = true, searchAll = false) {
    if (open && window.toggleSidebar) window.toggleSidebar(true);
    const registry = ensureAliasRegistry();
    const existing = registry.get(alias);
    if (existing?.open && !searchAll) {
        await existing.open();
        return existing.actual;
    }

    return new Promise(resolve => {
        const tabObj = window.tabManager.addTab({
            header: "@" + alias,
            name: "user-" + alias,
            content: `<div class="loading-ink">B"H Opening @${alias}...</div>`,
            async onopen({ actualTab, tab }) {
                tab.awtsmoosType = "specific alias comments";
                window.currentAliasTabContainer = actualTab;
                window.currentAliasBeingViewed = alias;
                actualTab.innerHTML = `<div class="loading-ink">B"H Opening @${alias} smoothly...</div>`;
                await nextFrame();
                await openCommentsOfAlias({ alias, actualTab, post: window.post, all: searchAll });
                resolve(actualTab);
            }
        });
        registry.set(alias, tabObj);
        tabObj.open();
    });
}

export async function openCommentsOfAlias({ alias, actualTab, post, all = false }) {
    await showAllComments({ tab: actualTab, post, alias, all });
}

window.openCommentsPanelToAlias = openCommentsPanelToAlias;
