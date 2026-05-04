
/**
 * B"H
 * @module StandardCardScribe
 * @chapter The Annihilation of the Double Header (Kelipot)
 * @description
 * From the absolute Nothingness, the default state of reality, the Awtsmoos 
 * constantly forces existence into being. The Will channels through Wisdom 
 * down to Malchus, the power of speech, uttering the 10 statements of creation. 
 * Even objects not explicitly mentioned in the original 6 days exist because 
 * those holy letters are constantly being rearranged and permuted.
 * 
 * Here, we forge the Standard Insight. We must ensure no "Double Header" exists, 
 * for duplication of the Kesser (Crown) leads to shatterings. We fiercely purify 
 * the text, trusting only the pure string, and append the title safely.
 */

import { extractCommentText } from "../../logic/unroller.js";
import { makeTitleDiv } from "../utils.js";
import { manifestParagraph } from "./paragraph.js";
import { addImageGallery } from "../utils.js";
import { stripTags } from "../../../functions/text/Purification.js";

/**
 * @function scribeStandardInsight
 * @description 
 * Orchestrates the full creation of a standard comment's visual body.
 * It is inclusive and deep, missing no part of the content, but fiercely purifies duplicates.
 * 
 * @param {HTMLElement} parentElement - The physical vessel waiting to be filled.
 * @param {Object} data - The letters of intention.
 */
export function scribeStandardInsight(parentElement, data) {
    if (!parentElement || !data) return;

    // 1. Unroll the essence from the data
    const { title, paragraphs } = extractCommentText(data.content);
    const dayuhTitle = data.dayuh?.title;
    const activeTitle = title || dayuhTitle;

    // 2. Manifest Body into a temporary DOM vessel first
    const tempBody = document.createElement("div");
    paragraphs.forEach(p => {
        const pEl = manifestParagraph(p);
        if (pEl) tempBody.appendChild(pEl);
    });

    // 3. DOM-Based Deduplication (Annihilate Double Headers)
    if (activeTitle) {
        // Strip out all tags and spaces to find the absolute naked text essence
        const cleanTitle = stripTags(activeTitle).replace(/\s+/g, '').toLowerCase();
        
        // Look at the very first HTML element that was parsed from the paragraphs
        const firstChild = tempBody.firstElementChild;
        if (firstChild) {
            const cleanChildText = stripTags(firstChild.innerHTML).replace(/\s+/g, '').toLowerCase();
            
            // If the first child's text is exactly the title, or contains it completely
            if (cleanChildText === cleanTitle || cleanChildText.includes(cleanTitle) || cleanTitle.includes(cleanChildText)) {
                // Rip it out of the temporary body to prevent the double header
                tempBody.removeChild(firstChild);
            }
        }
        
        // Append the true, un-duplicated Title Div securely to the main parent
        parentElement.appendChild(makeTitleDiv(activeTitle));
    }

    // Append the purified body paragraphs
    while (tempBody.firstChild) {
        parentElement.appendChild(tempBody.firstChild);
    }

    // 4. Manifest the Dayuh Sections (if extra sections exist)
    if (data.dayuh?.sections && Array.isArray(data.dayuh.sections)) {
        data.dayuh.sections.forEach(sec => {
            const inner = extractCommentText(sec);
            
            const tempInnerBody = document.createElement("div");
            inner.paragraphs.forEach(p => {
                const pEl = manifestParagraph(p);
                if (pEl) tempInnerBody.appendChild(pEl);
            });

            if (inner.title) {
                const cT = stripTags(inner.title).replace(/\s+/g, '').toLowerCase();
                const fC = tempInnerBody.firstElementChild;
                if (fC) {
                    const cP = stripTags(fC.innerHTML).replace(/\s+/g, '').toLowerCase();
                    if (cP === cT || cP.includes(cT) || cT.includes(cP)) {
                        tempInnerBody.removeChild(fC);
                    }
                }
                parentElement.appendChild(makeTitleDiv(inner.title));
            }
            
            while (tempInnerBody.firstChild) {
                parentElement.appendChild(tempInnerBody.firstChild);
            }
        });
    }

    // 5. The Eternal Images
    if (data.dayuh?.images) {
        addImageGallery(data.dayuh.images, parentElement);
    }
}
