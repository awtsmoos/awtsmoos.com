
/**
 * B"H
 * @module SparkFixer
 * @chapter Fixing the Vessels in the World of Action
 */

import { makeInlineComment } from "/heichelos/post/comments/render/core.js";
import { resolveCoordinateToDOM } from "/heichelos/post/comments/logic/inlineManifest/CoordinateResolver.js";
import { ShelterArchitect } from "/heichelos/post/comments/inline/weaving/ShelterArchitect.js";
import { GuardianGate } from "/heichelos/post/comments/inline/weaving/GuardianGate.js";

export class SparkFixer {
    /**
     * @method fix
     * @description Weaves purified sparks into their physical coordinates with absolute duplication guarding.
     */
    static fix(sparks, alias) {
        if (!Array.isArray(sparks) || sparks.length === 0) return;

        console.log(`%c B"H - [SparkFixer] Re-evaluating ${sparks.length} sparks for @${alias}.`, "color: #ff00ff;");

        const escapeForAttr = (value) => {
            const str = String(value);
            if (globalThis.CSS && typeof globalThis.CSS.escape === "function") return globalThis.CSS.escape(str);
            // Minimal safe fallback for attribute selectors wrapped in double quotes.
            return str.replace(/\\\\/g, "\\\\\\\\").replace(/\"/g, "\\\\\"");
        };

        let fixCount = 0;
        sparks.forEach(spark => {
            if (!spark || !spark.id) return;
            const sparkIdStr = String(spark.id);

            const coords = (spark.dayuh && typeof spark.dayuh === "object") ? spark.dayuh : {};
            // Some API responses place the coordinate outside of `dayuh`.
            if (coords.verseSection === undefined || coords.verseSection === null) {
                if (spark.verseSection !== undefined && spark.verseSection !== null) coords.verseSection = spark.verseSection;
            }
            if (coords.subSection === undefined || coords.subSection === null) {
                if (spark.subSection !== undefined && spark.subSection !== null) coords.subSection = spark.subSection;
                else if (spark.sub !== undefined && spark.sub !== null) coords.subSection = spark.sub;
            }
            const vessel = resolveCoordinateToDOM(coords);

            if (vessel) {
                const shelter = ShelterArchitect.secureShelter(vessel);
                
                // B"H - Verification of non-duplication
                const alreadyExists = shelter.querySelector(`[data-cid="${escapeForAttr(sparkIdStr)}"]`);
                if (alreadyExists) return;

                // Forge the Gate and Card
                let gate = Array.from(shelter.children).find(c => 
                    c.classList.contains("commentator") && c.dataset.alias === alias
                );

                if (!gate) {
                    gate = GuardianGate.build(alias, coords.verseSection);
                    shelter.appendChild(gate);
                }

                const list = gate.querySelector(".comments-holder-inline");
                if (list) {
                    const card = makeInlineComment(spark);
                    card.dataset.fromAlias = alias;
                    card.dataset.cid = sparkIdStr; 
                    
                    list.appendChild(card);
                    fixCount++;
                }
            }
        });

        if (fixCount > 0) {
            console.log(`%c B"H - [SparkFixer] Anchored ${fixCount} unique insights into the margins for @${alias}.`, "color: #00ff00; font-weight: bold;");
        }
    }
}
