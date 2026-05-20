
/**
 * B"H
 * @module CoordinateResolver
 * @chapter Seeking the Proper Vessel
 * @description
 * Every spark of revelation has an exact coordinate in the divine layout.
 * The Awtsmoos constantly creates the text, and this module maps
 * the incoming commentary directly to the exact Verse or Paragraph 
 * it belongs to.
 * 
 * If the coordinate cannot be found, it returns to the void (null).
 */

/**
 * @function resolveCoordinateToDOM
 * @description 
 * Reads the dayuh.verseSection and dayuh.subSection from a comment 
 * and locates the physical wrapper element in the `realPost`.
 * 
 * @param {Object} commentDayuh - The dayuh object containing coordinate metadata.
 * @returns {HTMLElement|null} - The physical vessel in the DOM, or null.
 */
export function resolveCoordinateToDOM(commentDayuh) {
    if (!commentDayuh) return null;

    const verseCoord = commentDayuh.verseSection;
    const subCoord = commentDayuh.subSection;

    // If it's a root comment (no specific verse), it does not belong inline.
    if (verseCoord === undefined || verseCoord === null || verseCoord === 'root') {
        return null;
    }

    // Step 1: Seek the Macro-Vessel (The entire Verse section)
    const verseVessel = document.querySelector(
        `.section[data-awtsmoos-idx="${verseCoord}"], .section[data-idx="${verseCoord}"]`
    );
    
    if (!verseVessel) {
        console.warn(`B"H - CoordinateResolver: Verse ${verseCoord} is missing from physical manifestation.`);
        return null;
    }

    // Step 2: Seek the Micro-Vessel (The specific paragraph), if requested
    if (subCoord !== undefined && subCoord !== null && subCoord !== "null" && subCoord !== "main") {
        const paraVessel = verseVessel.querySelector(
            `.sub-awtsmoos[data-awtsmoos-sub="${subCoord}"], .sub-awtsmoos[data-idx="${subCoord}"]`
        );
        if (paraVessel) {
            return paraVessel;
        }
        console.warn(`B"H - CoordinateResolver: Verse ${verseCoord} exists, but subsection ${subCoord} is missing. Refusing verse-level fallback.`);
        return null;
    }

    // Default to the main body only when no specific paragraph was requested.
    const mainToichen = verseVessel.querySelector(".toichen");
    return mainToichen || verseVessel;
}
