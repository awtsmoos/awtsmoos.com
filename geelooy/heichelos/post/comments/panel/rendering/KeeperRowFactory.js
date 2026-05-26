
/**
 * B"H
 * @module KeeperRowFactory
 * @chapter Forging the Seats of the Council
 * @description
 * Every commentator who adds their voice to the text is a Guardian (Keeper).
 * This factory forges the visual row in the sidebar that represents them,
 * providing the portal to their insights and the toggle to manifest their 
 * words in the margins.
 */

import { BlueprintManifestor } from "../../../logic/manifestation/BlueprintManifestor.js";
import { isAliasInline } from "../../state.js";
import { toggleInlineForComments } from "../../inline.js";

/**
 * @function createKeeperRow
 * @description Manifests the Neo-Brutalist card for a specific commentator.
 */
export function createKeeperRow(alias, triggerAliasTab) {
    const isInline = isAliasInline(alias);
    
    // Safety check for empty strings
    const validAlias = alias || "guest";
    const initial = validAlias.charAt(0).toUpperCase();

    const blueprint = {
        tag: 'div',
        attr: { class: 'keeper-row awtsmoos-list-item', 'data-alias': validAlias },
        children:[
            {
                tag: 'div',
                attr: { class: 'keeper-portal-trigger', title: `Enter insights of @${validAlias}` },
                children:[
                    { tag: 'div', attr: { class: 'commentator-avatar' }, children:[initial] },
                    { tag: 'span', attr: { class: 'commentator-name' }, children: [`@${validAlias}`] }
                ],
                events: {
                    click: (e) => {
                        e.stopPropagation();
                        triggerAliasTab(validAlias);
                    }
                }
            },
            {
                tag: 'div',
                attr: { class: 'keeper-controls' },
                children:[
                    createInlineToggle(validAlias, isInline),
                    { tag: 'span', attr: { class: 'keeper-arrow' }, children: ['→'] }
                ]
            }
        ]
    };

    return BlueprintManifestor.manifest(blueprint);
}

/**
 * @private
 * @function createInlineToggle
 */
function createInlineToggle(alias, isInline) {
    const safeAliasId = alias.replace(/\s+/g, '-'); 

    return {
        tag: 'div',
        attr: { class: 'inline-toggle-altar', title: 'Toggle Marginal Appearance' },
        children:[
            {
                tag: 'input',
                attr: { 
                    type: 'checkbox', 
                    id: `inline-toggle-${safeAliasId}`, 
                    class: 'inline-toggle-input',
                    ...(isInline ? { checked: true } : {}) 
                },
                events: {
                    click: (e) => e.stopPropagation(),
                    change: (e) => {
                        e.stopPropagation();
                        // Call the higher mutator logic to switch the worlds
                        toggleInlineForComments([], alias);
                    }
                }
            },
            { 
                tag: 'label', 
                attr: { 
                    for: `inline-toggle-${safeAliasId}`, 
                    class: 'inline-toggle-label' 
                },
                events: {
                    click: (e) => e.stopPropagation()
                }
            }
        ],
        events: {
            click: (e) => {
                e.stopPropagation();
                const input = e.currentTarget.querySelector('.inline-toggle-input');
                if (input && e.target !== input) input.click();
            }
        }
    };
}
