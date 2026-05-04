
/**
 * B"H
 * @module GuardianGate
 * @chapter The Portal of the Spokesman
 * @description
 * Within each marginal shelter, every Guardian (Alias) has their own Gate.
 * This gate allows the Seeker to reveal their transmissions and also 
 * serves as a portal to the Great Sidebar for comprehensive study.
 * 
 * "Everything is included in everything else."
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { SidebarConduit } from "../../../ui/sidebar/Conduit.js";

export class GuardianGate {
    /**
     * @method build
     * @description Manifests the Guardian's Gateway DOM element.
     * 
     * @param {string} alias - The identity of the Guardian.
     * @param {string|number} verseIdx - The coordinate in the scroll.
     * @returns {HTMLElement} - The gateway DOM.
     */
    static build(alias, verseIdx) {
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
                            
                            // B"H - Command the Sidebar to reveal its secrets.
                            SidebarConduit.openInsights({ verseIdx });

                            // B"H - Locally toggle the marginal list for immediate feedback.
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
