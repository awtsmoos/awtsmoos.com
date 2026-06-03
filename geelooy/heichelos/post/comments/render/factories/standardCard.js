// B"H
/**
 * @module StandardCardScribe
 * @description
 * Chapter 129: The body stops repeating the crown.
 * A shared comment card already has an author/title/coordinate header. When the
 * Awtsmoos places text inside that card, the inner body must be only the actual
 * comment body. No title may reappear as a second body line.
 */

import { extractCommentText } from "../../logic/unroller.js";
import { makeTitleDiv, addImageGallery } from "../utils.js";
import { manifestParagraph } from "./paragraph.js";
import { stripTags } from "../../../functions/text/Purification.js";

function compactText(value) {
    return stripTags(value || "").replace(/\s+/g, "").toLowerCase();
}

function shouldHideTitle(parentElement, data) {
    return Boolean(
        data?.__awtsmoosSharedCardBody ||
        parentElement?.closest?.(".awtsmoos-shared-comment-card")
    );
}

function removeDuplicateOpening(body, title) {
    if (!title) return;
    const cleanTitle = compactText(title);
    const firstChild = body.firstElementChild;
    if (!firstChild) return;
    const cleanChild = compactText(firstChild.innerHTML);
    if (!cleanChild || !cleanTitle) return;
    if (cleanChild === cleanTitle || cleanChild.includes(cleanTitle) || cleanTitle.includes(cleanChild)) {
        firstChild.remove();
    }
}

function appendParagraphs(body, paragraphs = []) {
    paragraphs.forEach(paragraph => {
        const node = manifestParagraph(paragraph);
        if (node) body.appendChild(node);
    });
}

function appendBody(parentElement, body) {
    while (body.firstChild) parentElement.appendChild(body.firstChild);
}

function appendTitledSection(parentElement, title, paragraphs, includeTitle) {
    const tempBody = document.createElement("div");
    appendParagraphs(tempBody, paragraphs);
    removeDuplicateOpening(tempBody, title);
    if (title && includeTitle) parentElement.appendChild(makeTitleDiv(title));
    appendBody(parentElement, tempBody);
}

function appendExtraSections(parentElement, sections, includeTitles) {
    if (!Array.isArray(sections)) return;
    sections.forEach(section => {
        const inner = extractCommentText(section);
        appendTitledSection(parentElement, inner.title, inner.paragraphs, includeTitles);
    });
}

/**
 * Fills a comment body. In a shared card it suppresses inner title duplication;
 * outside a shared card it preserves the older standalone titled layout.
 * @param {HTMLElement} parentElement Body vessel.
 * @param {Object} data Normalized comment data.
 * @returns {void}
 */
export function scribeStandardInsight(parentElement, data) {
    if (!parentElement || !data) return;
    const { title, paragraphs } = extractCommentText(data.content);
    const activeTitle = title || data.dayuh?.title;
    const includeTitles = !shouldHideTitle(parentElement, data);

    appendTitledSection(parentElement, activeTitle, paragraphs, includeTitles);
    appendExtraSections(parentElement, data.dayuh?.sections, includeTitles);

    if (data.dayuh?.images) addImageGallery(data.dayuh.images, parentElement);
}
