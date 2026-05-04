
/**
 * B"H
 * @module SectionManifestor
 * @chapter The Distribution of the Sparks
 * @description
 * After the BulkLoader has gathered the Light, the SectionManifestor 
 * is tasked with the holy work of placement. It iterates through 
 * the purified sparks and ensures each one is nested within the 
 * correct physical Verse (Section) according to its coordinates.
 */

import { resolveCoordinateToDOM } from "./CoordinateResolver.js";
import { weaveInsightIntoMargin } from "./MarginalDOMWeaver.js";

/**
 * @function manifestSparksInDOM
 * @description
 * Distributes a collection of comment sparks to their respective DOM elements.
 * 
 * @param {Array} sparks - The collection of purified comment objects.
 * @param {string} alias - The identity of the Guardian these sparks belong to.
 */
export function manifestSparksInDOM(sparks, alias) {
    if (!Array.isArray(sparks)) return;

    let successCount = 0;
    sparks.forEach(spark => {
        try {
            // Ensure the spark knows its own coordinates
            const coords = spark.dayuh || {};
            
            // Resolve the physical vessel in the reader
            const vessel = resolveCoordinateToDOM(coords);
            
            if (vessel) {
                weaveInsightIntoMargin(vessel, spark, alias);
                successCount++;
            }
        } catch (e) {
            console.error("B\"H - [SectionManifestor] Error weaving a specific spark:", e, spark);
        }
    });

    if (successCount > 0) {
        console.log(`%c B"H - [SectionManifestor] Successfully wove ${successCount} insights into the margins for @${alias}.`, "color: #00ccff;");
    }
}
