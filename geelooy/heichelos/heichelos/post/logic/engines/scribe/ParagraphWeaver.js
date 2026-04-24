
import { sanitizeContent } from "../../../functions/text/Sanitizer.js";
import { isHebrew } from "../../../functions/text/LanguageSentinel.js";

/**
 * B"H
 * @module ParagraphWeaver
 * @description 
 * Just as the soul weaves itself into the physical limbs, 
 * this weaver embeds the sparks of text into the DOM.
 */

/**
 * @function weaveParagraphs
 * @description Forges a container of paragraph nodes.
 * @param {Array<string>} sparks - The raw text strings.
 * @param {number} sectionId - The ID of the parent section.
 * @returns {HTMLElement} - A div containing all woven sub-sections.
 */
export function weaveParagraphs(sparks, sectionId) {
    const container = document.createElement("div");
    container.className = "awtsmoos-paragraphs-vessel";

    sparks.forEach((text, pIdx) => {
        const pEl = document.createElement("div");
        pEl.className = "sub-awtsmoos paragraph-unit";
        
        // Metadata for the Hunter and the Conductor
        pEl.dataset.awtsmoosSub = pIdx;
        pEl.dataset.awtsmoosIdx = sectionId;

        // B"H - Detect the holiness of the language
        if (isHebrew(text)) {
            pEl.classList.add("heb-text");
            pEl.dir = "rtl";
        } else {
            pEl.classList.add("eng-text");
            pEl.dir = "ltr";
        }

        // B"H - Sanitize and manifest
        pEl.innerHTML = sanitizeContent(text);
        
        container.appendChild(pEl);
    });

    return container;
}
