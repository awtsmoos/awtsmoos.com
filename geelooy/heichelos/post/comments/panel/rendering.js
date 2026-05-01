
/**
 * B"H
 * @module CommentatorListRenderer
 * @chapter The Gathering of the Keepers
 */

import { makeCommentatorList as _internalList } from "./fetching.js"; // Standardizing
import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { openCommentsOfAlias } from "../panel.js";
import { getAndSaveAliases } from "./fetching.js";

/**
 * @method makeCommentatorList
 * @description Manifests the Council of Keepers in the sidebar.
 */
export async function makeCommentatorList(actualTab, forceFresh = false) {
    actualTab.innerHTML = "";
    
    // Add Transcription Altar (Previously separate, now unified)
    const { makeAddCommentSection } = await import("../panel/rendering.js");
    makeAddCommentSection(actualTab);

    const aliases = await getAndSaveAliases(false, forceFresh);
    
    if (!aliases || aliases.length === 0) {
        actualTab.appendChild(BlueprintManifestor.manifest({
            tag: 'div',
            attr: { class: 'empty-assembly-msg' },
            children: ['No Guardians have spoken here yet.']
        }));
        return;
    }

    const container = document.createElement("div");
    container.className = "keepers-container";
    actualTab.appendChild(container);

    aliases.forEach(alias => {
        const itemPlan = {
            tag: 'div',
            attr: { class: 'keeper-row awtsmoos-list-item', 'data-alias': alias },
            children: [
                {
                    tag: 'div',
                    attr: { class: 'keeper-info' },
                    children: [
                        { tag: 'div', attr: { class: 'keeper-avatar' }, children: [alias[0].toUpperCase()] },
                        { tag: 'span', attr: { class: 'keeper-name' }, children: [`@${alias}`] }
                    ]
                },
                { tag: 'span', attr: { class: 'keeper-arrow' }, children: ['→'] }
            ],
            events: {
                click: (e) => {
                    e.stopPropagation();
                    triggerAliasTab(alias);
                }
            }
        };
        container.appendChild(BlueprintManifestor.manifest(itemPlan));
    });
}

function triggerAliasTab(alias) {
    window.tabManager.addTab({
        header: "@" + alias,
        name: "user-" + alias,
        onopen: async ({ actualTab, tab }) => {
            tab.awtsmoosType = "specific alias comments";
            window.currentAliasBeingViewed = alias;
            window.currentAliasTabContainer = actualTab;
            await openCommentsOfAlias({ alias, actualTab, post: window.post });
        }
    }).open();
}
