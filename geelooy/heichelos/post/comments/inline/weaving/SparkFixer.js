
/**
 * B"H
 * @module SparkFixer
 * @chapter Fixing the Vessels
 */

import { makeInlineComment } from "/heichelos/post/comments/render/core.js";
import { resolveCoordinateToDOM } from "/heichelos/post/comments/logic/inlineManifest/CoordinateResolver.js";
import { ShelterArchitect } from "/heichelos/post/comments/inline/weaving/ShelterArchitect.js";
import { GuardianGate } from "/heichelos/post/comments/inline/weaving/GuardianGate.js";

export class SparkFixer {
    /**
     * @method fix
     * @description Weaves purified sparks into their physical coordinates.
     */
    static fix(sparks, alias) {
        if (!Array.isArray(sparks)) return;

        let fixCount = 0;
        sparks.forEach(spark => {
            const coords = spark.dayuh || {};
            const verseIdx = coords.verseSection;
            const vessel = resolveCoordinateToDOM(coords);

            if (vessel) {
                const shelter = ShelterArchitect.establishShelter(vessel);
                
                let gate = Array.from(shelter.children).find(c => 
                    c.classList.contains("commentator") && c.dataset.alias === alias
                );

                if (!gate) {
                    gate = GuardianGate.build(alias, verseIdx);
                    shelter.appendChild(gate);
                }

                const list = gate.querySelector(".comments-holder-inline");
                if (list) {
                    // B"H - Verification of non-duplication
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
