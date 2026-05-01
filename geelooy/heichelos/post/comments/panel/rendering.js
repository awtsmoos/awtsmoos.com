
/**
 * B"H
 * @module SidebarRenderingScribe
 * @chapter The Assembly of the Insight-Keepers
 * @description
 * Every commentator is a portal to a deeper dimension of the text. 
 * This module coordinates the manifestation of the Keepers list, 
 * uniting the Altar, the AI Gateway, and the individual Keeper Rows.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { openCommentsOfAlias } from "../panel.js";
import { getAndSaveAliases } from "./fetching.js";
import { buildCommentTree } from "../logic/treeBuilder.js";
import { renderTreeItem } from "../render/tree.js";
import { makeHTMLFromComment } from "../render/core.js";

// B"H - Import the micro-vessels
import { makeAddCommentSection } from "./rendering/AltarFactory.js";
import { createKeeperRow } from "./rendering/KeeperRowFactory.js";

// Re-export for any legacy conduits that expect it from here
export { makeAddCommentSection };

/**
 * @method makeCommentatorList
 * @description The ritual to manifest the Council of Keepers.
 */
export async function makeCommentatorList(actualTab, forceFresh = false) {
    actualTab.innerHTML = "";
    
    // 1. The Transcription Altar
    makeAddCommentSection(actualTab);

    // 2. The AI Oracle Gateway (A direct emanation from the Blueprint)
    const aiRow = BlueprintManifestor.manifest({
        tag: 'div',
        attr: { class: 'awtsmoos-list-item ai-monolith' },
        children:[
            {
                tag: 'div',
                attr: { class: 'keeper-content' },
                children:[
                    { tag: 'span', attr: { class: 'keeper-icon' }, children: ['✨'] },
                    { tag: 'span', attr: { class: 'keeper-name' }, children: ['ASK AWTSMOOS AI'] }
                ]
            },
            { tag: 'span', attr: { class: 'keeper-arrow' }, children: ['→'] }
        ],
        events: {
            click: async () => {
                const { openAIChat } = await import("../../ai/chat.js");
                openAIChat();
            }
        }
    });
    actualTab.appendChild(aiRow);

    const keepersWrap = document.createElement("div");
    keepersWrap.className = "keepers-assembly";
    actualTab.appendChild(keepersWrap);
    
    // 3. Gathering the Guardians
    const aliases = await getAndSaveAliases(false, forceFresh, null, undefined, false);
    
    if (!aliases || aliases.length === 0) {
        keepersWrap.innerHTML = `<div class="assembly-void-msg">The chambers are currently silent.</div>`;
        return;
    }

    // 4. Manifesting the Council
    aliases.forEach(alias => {
        const row = createKeeperRow(alias, triggerAliasTab);
        keepersWrap.appendChild(row);
    });
}

/**
 * @private
 * @function triggerAliasTab
 */
function triggerAliasTab(alias) {
    window.tabManager.addTab({
        header: "@" + alias,
        name: "user-" + alias,
        content: `<div class="loading-ink">Seeking records of @${alias}...</div>`,
        async onopen({ actualTab, tab }) { 
            tab.awtsmoosType = "specific alias comments";
            window.currentAliasTabContainer = actualTab; 
            window.currentAliasBeingViewed = alias;
            await openCommentsOfAlias({ alias, actualTab: actualTab, post: window.post });
        }
    }).open();
}

/**
 * @method renderControlsAndComments
 * @description Pours a specific Guardian's comments into the timeline view.
 */
export function renderControlsAndComments(coms, alias, tab) {
    tab.innerHTML = "";
    const treeRoots = buildCommentTree(coms);
    
    const listContainer = document.createElement("div");
    listContainer.className = "sidebar-comment-list";
    
    treeRoots.forEach(node => {
        renderTreeItem(node, listContainer, (c) => makeHTMLFromComment(c), 'sidebar');
    });
    
    tab.appendChild(listContainer);
}
