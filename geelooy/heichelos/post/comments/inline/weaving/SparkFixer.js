
/**
 * B"H
 * @module SparkFixer
 * @chapter The Tikkun of the Margins
 * @description
 * Once the sparks are gathered, they must be "fixed" into the DOM.
 * This module ensures that every card is unique, checking the ID
 * of the insight before manifestation.
 */

import { makeInlineComment } from "/heichelos/post/comments/render/core.js";
import { resolveCoordinateToDOM } from "/heichelos/post/comments/logic/inlineManifest/CoordinateResolver.js";
import { ShelterArchitect } from "./ShelterArchitect.js";
import { GuardianGate } from "./GuardianGate.js";

export class SparkFixer {
    /**
     * @method fix
     * @description Places the purified sparks into their physical vessels.
     * 
     * @param {Array} sparks - The comment data.
     * @param {string} alias - The Guardian's name.
     */
    static fix(sparks, alias) {
        if (!Array.isArray(sparks)) return;

        let fixCount = 0;
        sparks.forEach(spark => {
            const coords = spark.dayuh || {};
            const verseIdx = coords.verseSection;
            
            // 1. Find the Verse Element.
            const vessel = resolveCoordinateToDOM(coords);

            if (vessel) {
                // 2. Ensure a Shelter exists for the Margin.
                const shelter = ShelterArchitect.establishShelter(vessel);
                
                // 3. Find or manifest the Guardian's dedicated Gate.
                let gate = Array.from(shelter.children).find(c => 
                    c.classList.contains("commentator") && c.dataset.alias === alias
                );

                if (!gate) {
                    gate = GuardianGate.build(alias, verseIdx);
                    shelter.appendChild(gate);
                }

                const list = gate.querySelector(".comments-holder-inline");
                if (list) {
                    // B"H - CRITICAL: Check if this specific insight already exists.
                    if (!list.querySelector(`[data-cid="${spark.id}"]`)) {
                        const card = makeInlineComment(spark);
                        card.dataset.fromAlias = alias;
                        list.appendChild(card);
                        fixCount++;
                    }
                }
            }
        });

        if (fixCount > 0) {
            console.log(`%c B"H - [SparkFixer] Manifested ${fixCount} new insights for @${alias}.`, "color: #00ff00;");
        }
    }
}
