
/**
 * B"H
 * @module SidebarRenderingScribe
 * @description
 * Chapter 15: The Assembly of the Insight-Keepers now opens smoothly. The
 * Awtsmoos does not throw all students and all comment trees into one choking
 * instant; the browser receives them in measured breaths.
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

function loadingNode(text) {
    return BlueprintManifestor.manifest({
        tag: "div",
        attr: { class: "loading-ink awtsmoos-smooth-loading" },
        children: [text]
    });
}

function makeAiRow() {
    return BlueprintManifestor.manifest({
        tag: "div",
        attr: { class: "awtsmoos-list-item ai-monolith" },
        children: [
            { tag: "div", attr: { class: "keeper-content" }, children: [
                { tag: "span", attr: { class: "keeper-icon" }, children: ["✨"] },
                { tag: "span", attr: { class: "keeper-name" }, children: ["ASK AWTSMOOS AI"] }
            ] },
            { tag: "span", attr: { class: "keeper-arrow" }, children: ["→"] }
        ],
        events: { click: async () => {
            const { openAIChat } = await import("../../ai/chat.js");
            openAIChat();
        } }
    });
}

/**
 * Manifests the Council of Keepers without blocking one frame.
 * @param {Element} actualTab Sidebar tab body.
 * @param {boolean} [forceFresh=false] Whether to bypass cache.
 */
export async function makeCommentatorList(actualTab, forceFresh = false) {
    actualTab.innerHTML = "";
    makeAddCommentSection(actualTab);
    actualTab.appendChild(makeAiRow());

    const keepersWrap = document.createElement("div");
    keepersWrap.className = "keepers-assembly";
    actualTab.appendChild(keepersWrap);
    keepersWrap.appendChild(loadingNode("Gathering commentators…"));

    await nextFrame();
    const aliases = await getAndSaveAliases(false, forceFresh, null, undefined, false);
    keepersWrap.innerHTML = "";
    if (!aliases || aliases.length === 0) {
        keepersWrap.innerHTML = `<div class="assembly-void-msg">The chambers are currently silent.</div>`;
        return;
    }
    await renderChunked(aliases, alias => createKeeperRow(alias, triggerAliasTab), keepersWrap, 10);
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
        content: `<div class="loading-ink">Seeking records of @${alias}...</div>`,
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
    listContainer.className = "sidebar-comment-list";
    tab.innerHTML = "";
    tab.appendChild(listContainer);

    await renderChunked(treeRoots, node => {
        const holder = document.createElement("div");
        renderTreeItem(node, holder, c => makeHTMLFromComment(c), "sidebar");
        return holder.firstElementChild;
    }, listContainer, 5);
}
