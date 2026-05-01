
/**
 * B"H
 * @module StandardCardScribe
 * @chapter The Assembly of the Insight-Tabernacle
 */

import { extractCommentText } from "../../logic/unroller.js";
import { makeTitleDiv } from "../utils.js";
import { manifestParagraph } from "./paragraph.js";
import { addImageGallery } from "../utils.js";

/**
 * @function scribeStandardInsight
 * @description 
 * Orchestrates the full creation of a standard comment's visual body.
 * It is inclusive and deep, missing no part of the content.
 * 
 * @param {HTMLElement} parentElement - The stage to manifest upon.
 * @param {Object} data - The raw comment data.
 */
export function scribeStandardInsight(parentElement, data) {
    if (!parentElement || !data) return;

    // 1. Unroll the essence from the data
    const { title, paragraphs } = extractCommentText(data.content);
    const dayuhTitle = data.dayuh?.title;

    // 2. Manifest the Head (Title)
    const activeTitle = title || dayuhTitle;
    if (activeTitle) {
        parentElement.appendChild(makeTitleDiv(activeTitle));
    }

    // 3. Manifest the Body (Paragraphs)
    paragraphs.forEach(p => {
        const pEl = manifestParagraph(p);
        if (pEl) parentElement.appendChild(pEl);
    });

    // 4. Manifest the Dayuh Sections (if extra sections exist)
    if (data.dayuh?.sections && Array.isArray(data.dayuh.sections)) {
        data.dayuh.sections.forEach(sec => {
            const inner = extractCommentText(sec);
            if (inner.title) parentElement.appendChild(makeTitleDiv(inner.title));
            inner.paragraphs.forEach(p => {
                const pEl = manifestParagraph(p);
                if (pEl) parentElement.appendChild(pEl);
            });
        });
    }

    // 5. The Eternal Images
    if (data.dayuh?.images) {
        addImageGallery(data.dayuh.images, parentElement);
    }
}
