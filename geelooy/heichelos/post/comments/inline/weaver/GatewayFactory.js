
/**
 * B"H
 * @module GatewayFactory
 * @chapter The Gate of the Guardian
 * @description
 * The Gateway is the specific residence of a Guardian's insights.
 * It consists of a button to reveal/hide their transmission and 
 * a container for the actual comment cards.
 * 
 * "Open for me the gates of righteousness."
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { SidebarConduit } from "../../../ui/sidebar/SidebarConduit.js";

export class GatewayFactory {
    /**
     * @method forgeGateway
     * @description
     * Builds the Guardian's Gateway using the BlueprintManifestor.
     * 
     * @param {string} alias - The identity of the Guardian.
     * @param {string|number} verseIdx - The coordinate in the scroll.
     * @returns {HTMLElement} - The physical Gateway.
     */
    static forgeGateway(alias, verseIdx) {
        const blueprint = {
            tag: 'div',
            attr: { 
                class: 'commentator inline-holder', 
                'data-alias': alias, 
                'data-idx': verseIdx 
            },
            children: [
                {
                    tag: 'button',
                    attr: { class: 'inline-summary-btn active' },
                    children: [
                        { tag: 'span', children: ['💬'] },
                        { tag: 'span', children: [`Insights (@${alias})`] }
                    ],
                    events: {
                        click: (e) => {
                            e.stopPropagation();
                            // B"H - Trigger the global sidebar conduit
                            SidebarConduit.revealInsights({ verseIdx });

                            // Local toggle
                            const list = e.currentTarget.nextElementSibling;
                            if (list) {
                                const isHidden = getComputedStyle(list).display === "none";
                                list.style.display = isHidden ? "flex" : "none";
                                e.currentTarget.classList.toggle("active", isHidden);
                            }
                        }
                    }
                },
                {
                    tag: 'div',
                    attr: { class: 'comments-holder-inline', style: 'display: flex;' }
                }
            ]
        };

        return BlueprintManifestor.manifest(blueprint);
    }
}
