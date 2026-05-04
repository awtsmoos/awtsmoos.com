
/**
 * B"H
 * @module GuardianGate
 * @chapter The portal of the Spokesman
 * @description
 * Every Guardian (Alias) has their own gate within the margin.
 * This gate allows the seeker to expand/collapse the transmission 
 * and also serves as a portal to the Great Sidebar for deeper study.
 * 
 * "Open the gates, that the righteous nation... may enter."
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { SidebarConduit } from "/heichelos/post/ui/sidebar/Conduit.js";

export class GuardianGate {
    /**
     * @method build
     * @description Manifests the Guardian's Gateway.
     * 
     * @param {string} alias - The identity.
     * @param {string|number} verseIdx - The coordinate.
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
                            
                            // B"H - Command the Sidebar to reveal the Secrets.
                            console.log(`B"H - [GuardianGate] Insights button clicked for @${alias}.`);
                            SidebarConduit.openChamber({ idx: verseIdx });

                            // B"H - Locally toggle the marginal list.
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
