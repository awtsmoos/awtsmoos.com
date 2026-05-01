
/**
 * B"H
 * @module StandardCardScribe
 * @chapter The Assembly of the Insight-Tabernacle
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
                // Rip it out of the temporary body
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
