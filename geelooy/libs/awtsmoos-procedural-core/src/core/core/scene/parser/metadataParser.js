
// B"H
/**
 * @file metadataParser.js
 * @brief Extracts and preserves the non-geometric metadata of a scene object.
 * 
 * THE TRACTATE OF PRESERVATION:
 * When the object is parsed, its vertices are sent to the Buffer,
 * but its spiritual measurements—the Exported Points—must not be lost to the void!
 * This Scribe catches the 'exportedPoints' object and ensures it rides along
 * the Seder Hishtalshelus (chain of emanation) all the way to the SceneGraphDrawer.
 */

export class MetadataParser {
    /**
     * B"H - Extracts the hidden metadata from the raw object data.
     * @param {object} objData - The raw JSON manifestation of the object.
     * @returns {object} The preserved metadata object.
     */
    static extract(objData) {
        const metadata = {};
        
        // B"H - CRITICAL TIKKUN: If the Geometry Generator created exportedPoints, SAVE THEM!
        if (objData.exportedPoints) {
            metadata.exportedPoints = { ...objData.exportedPoints };
            console.log(`B"H - MetadataParser: Safely preserved ${Object.keys(metadata.exportedPoints).length} exported points for [${objData.id}].`);
        } else {
            metadata.exportedPoints = null;
        }

        return metadata;
    }
}
