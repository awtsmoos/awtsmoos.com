/**
 * B"H
 * @module InlineCoordinateLocator
 * @chapter Mapping the manifest landscape
 */

/**
 * @function findInsertionVessel
 * @description 
 * Scans the Scroll to find the physical element matching the Verse/Paragraph.
 */
export function findInsertionVessel(comment) {
    const verseCoord = comment.dayuh?.verseSection;
    const subCoord = comment.dayuh?.subSection;

    if (verseCoord === undefined || verseCoord === null) return null;

    // Seeks the General Vessel (Verse)
    const verseEl = document.querySelector(
        `.section[data-awtsmoos-idx="${verseCoord}"], .section[data-idx="${verseCoord}"]`
    );
    
    if (!verseEl) return null;

    // Seeks the Particular Spark (Paragraph) if specified
    if (subCoord !== undefined && subCoord !== null && subCoord !== "null") {
        const paraEl = verseEl.querySelector(
            `.sub-awtsmoos[data-awtsmoos-sub="${subCoord}"], .sub-awtsmoos[data-idx="${subCoord}"]`
        );
        if (paraEl) return paraEl;
    }

    // Default to the main body of the verse
    return verseEl.querySelector(".toichen");
}