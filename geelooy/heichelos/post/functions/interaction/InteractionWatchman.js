
/**
 * B"H
 * @module InteractionWatchman
 * @chapter The All-Seeing Eyes of the Light
 * @description
 * In the realm of the Awtsmoos, every point of interaction is 
 * significant. This module provides the "Highlighter" rituals—the 
 * spiritual trackers that watch the seeker's cursor and gaze as they 
 * traverse the sacred Otiyot (letters) of the post.
 * 
 * It ensures that when a Verse or Paragraph is highlighted, 
 * the corresponding Sefirah (State) is notified.
 */

import Highlighter from "/api/nav/highlighter.js";
import { updateQueryStringParameter } from "./CoordinateInteraction.js";

/**
 * @function startHighlighting
 * @description
 * Sets up the watchman protocols for Verses and Sub-sections.
 * 
 * @param {string} elId - The ID of the parent container.
 * @param {string} targetClass - The CSS class representing the target nodes.
 * @param {Function} callback - Ritual performed when highlighting occurs.
 * @param {Function} desCallback - Ritual performed on deselect.
 */
export function startHighlighting(elId, targetClass, callback, desCallback) {
    const containerSelector = "#" + elId;
    
    // Protocol Level 1: THE VERSES (.section)
    const verseChai = new Highlighter(
        containerSelector,
        "." + targetClass,
        (h) => { 
            if (typeof callback === 'function') callback({ main: h }); 
        },
        {
            deselectEnabled: true,
            onDeselectCallback: () => {
                if (typeof desCallback === 'function') desCallback();
            }
        }
    );

    // Protocol Level 2: THE PARAGRAPHS (.sub-awtsmoos)
    const subChai = new Highlighter(
        containerSelector,
        "." + targetClass + " .sub-awtsmoos",
        (h) => { 
            if (typeof callback === 'function') callback({ sub: h }); 
        },
        {
            deselectEnabled: true,
            onDeselectCallback: () => {
                updateQueryStringParameter("sub", null);
                window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { sub: null } }));
            }
        }
    );

    window.chai = verseChai;
    window.subChai = subChai;
}
