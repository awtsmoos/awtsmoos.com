
/**
 * B"H
 * @module CoordinateResolver
 * @chapter Seeking the Proper Vessel
 * @description
 * The old inline manifestor still asks for one HTMLElement. The new anchor
 * engine knows richer truth: section, subsection, paragraph, token span,
 * character span, and semantic fingerprint repair. This adapter keeps the old
 * API stable while letting the Awtsmoos reveal the newer coordinate ladder.
 */

import { resolveCommentAnchor } from "../../inline/anchors/index.js";

/**
 * @function resolveCoordinateToDOM
 * @description
 * Resolves legacy `dayuh` coordinate metadata into the DOM element expected by
 * the marginal weaver. Rich range data remains available through the anchor
 * engine, while this compatibility gate returns only the physical vessel.
 *
 * @param {Object} commentDayuh The dayuh object containing coordinate metadata.
 * @returns {HTMLElement|null} The physical vessel in the DOM, or null.
 */
export function resolveCoordinateToDOM(commentDayuh) {
    if (!commentDayuh) return null;

    const anchor = resolveCommentAnchor(commentDayuh);
    if (anchor.element) return anchor.element;

    const verseCoord = commentDayuh.verseSection;
    const subCoord = commentDayuh.subSection;
    const missingSub = subCoord !== undefined && subCoord !== null && subCoord !== "null" && subCoord !== "main";

    if (verseCoord !== undefined && verseCoord !== null && verseCoord !== "root") {
        console.warn(
            missingSub
                ? `B"H - CoordinateResolver: Verse ${verseCoord} or subsection ${subCoord} is missing.`
                : `B"H - CoordinateResolver: Verse ${verseCoord} is missing from physical manifestation.`
        );
    }

    return null;
}
