//B"H
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { sanitizeComment, makeTitleDiv, addImageGallery } from "./utils.js";

/**
 * @method renderStandardComment
 * @description Renders standard text/markdown comments.
 */
export function renderStandardComment(parentElement, normalizedComment) {
    // 1. Text Content
    if (normalizedComment.content) {
        const textDiv = document.createElement("div");
        textDiv.innerHTML = markdownToHtml(sanitizeComment(normalizedComment.content));
        parentElement.appendChild(textDiv);
    }

    // 2. Extra Sections
    if (Array.isArray(normalizedComment.dayuh?.sections)) {
        normalizedComment.dayuh.sections.forEach(sectionData => {
            const txt = sectionData?.text || (typeof sectionData === 'string' ? sectionData : "");
            if (!txt && !sectionData?.title) return;
            const sec = document.createElement("div");
            sec.className = "awtsmoos-comment-section";
            if (sectionData?.title) sec.appendChild(makeTitleDiv(sectionData.title));
            if (txt) {
                const textDiv = document.createElement('div');
                textDiv.innerHTML = markdownToHtml(sanitizeComment(txt));
                sec.appendChild(textDiv);
            }
            parentElement.appendChild(sec);
        });
    }
    
    // 3. Images
    addImageGallery(normalizedComment?.dayuh?.images, parentElement);
}
