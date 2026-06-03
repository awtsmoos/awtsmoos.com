// B"H
/**
 * @module StandardCardScribe
 * @description
 * Chapter 174: The fallback becomes a guardian, not a thief.
 * The shared card already displays the title in its header. This scribe now
 * extracts every known body vessel, removes only a true duplicate title line,
 * and refuses to resurrect that same title as fallback body. The Awtsmoos lets
 * absence stay honest and lets real body-light blaze without being swallowed.
 */

import { extractCommentText } from "../../logic/unroller.js";
import { makeTitleDiv, addImageGallery } from "../utils.js";
import { manifestParagraph } from "./paragraph.js";
import { stripTags } from "../../../functions/text/Purification.js";

function compactText(value) {
    return stripTags(value || "").replace(/\s+/g, "").toLowerCase();
}

function shouldHideTitle(parentElement, data) {
    return Boolean(data?.__awtsmoosSharedCardBody || parentElement?.closest?.(".awtsmoos-shared-comment-card"));
}

function isDuplicateTitleParagraph(childText, titleText) {
    const child = compactText(childText);
    const title = compactText(titleText);
    if (!child || !title) return false;
    if (child === title) return true;
    if (child.startsWith(title) && child.length <= title.length + 3) return true;
    return false;
}

function removeDuplicateOpening(body, title) {
    if (!title) return;
    const firstChild = body.firstElementChild;
    if (!firstChild) return;
    if (isDuplicateTitleParagraph(firstChild.textContent || firstChild.innerHTML, title)) firstChild.remove();
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

function mergeText(primary, fallback) {
    const output = { title: primary.title || fallback.title || "", paragraphs: [...primary.paragraphs] };
    if (!output.paragraphs.length) output.paragraphs.push(...fallback.paragraphs);
    return output;
}

function extractDayuhText(data) {
    return extractCommentText(data?.dayuh?.text || data?.dayuh?.body || data?.dayuh?.plain || data?.dayuh?.html || data?.dayuh?.message || data?.dayuh?.description);
}

function extractRootText(data) {
    return extractCommentText(data?.text || data?.body || data?.plain || data?.html || data?.message || data?.description);
}

function extractBodyData(data) {
    const fromContent = extractCommentText(data?.content);
    const fromDayuhContent = extractCommentText(data?.dayuh?.content);
    return [fromDayuhContent, extractDayuhText(data), extractRootText(data)].reduce(mergeText, fromContent);
}

function knownTitles(data) {
    return [data?.dayuh?.title, data?.content?.title, data?.title].filter(Boolean).map(compactText).filter(Boolean);
}

function fallbackBodies(data) {
    return [data?.body, data?.content?.body, data?.dayuh?.body, data?.text, data?.content?.text, data?.dayuh?.text, data?.plain, data?.content?.plain, data?.dayuh?.plain].flat().filter(Boolean);
}

function ensureVisibleBody(parentElement, data) {
    if (parentElement.children.length || parentElement.textContent.trim()) return;
    const titles = knownTitles(data);
    const fallback = fallbackBodies(data).find(text => {
        const compact = compactText(text);
        return compact && !titles.includes(compact);
    });
    if (fallback) appendParagraphs(parentElement, [fallback]);
}

/**
 * Fills a comment body while avoiding title/body duplication.
 * @param {HTMLElement} parentElement Body vessel.
 * @param {Object} data Normalized comment data.
 * @returns {void}
 */
export function scribeStandardInsight(parentElement, data) {
    if (!parentElement || !data) return;
    const { title, paragraphs } = extractBodyData(data);
    const activeTitle = title || data.dayuh?.title || data?.content?.title || data?.title;
    const includeTitles = !shouldHideTitle(parentElement, data);

    appendTitledSection(parentElement, activeTitle, paragraphs, includeTitles);
    appendExtraSections(parentElement, data.dayuh?.sections, includeTitles);
    ensureVisibleBody(parentElement, data);

    if (data.dayuh?.images) addImageGallery(data.dayuh.images, parentElement);
}
