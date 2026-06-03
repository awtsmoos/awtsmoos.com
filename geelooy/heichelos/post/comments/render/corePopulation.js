// B"H
/**
 * @module CorePopulationRitual
 * @description
 * Chapter 130: Filling the hollow body without doubling the crown.
 * The Awtsmoos takes raw comment light and enclothes it in the DOM. When the
 * vessel is a shared card, the body receives only body text; the surrounding
 * card already bears author, title, and coordinates.
 */

import { isFirstCharacterHebrew } from "../../functions/text/LinguisticSpeech.js";
import { renderBranchingThread } from "./ai/structure.js";
import { renderStandardComment } from "./standard.js";

function cloneComment(comment) {
    return JSON.parse(JSON.stringify(comment));
}

function markSharedCardBody(parentElement, data) {
    if (!parentElement?.closest?.(".awtsmoos-shared-comment-card")) return data;
    data.__awtsmoosSharedCardBody = true;
    return data;
}

function preserveLegacyTitle(data) {
    if (data?.content?.title) {
        if (!data.dayuh) data.dayuh = {};
        data.dayuh.title = data.content.title;
    }
    return data;
}

function synchronizeLinguisticVibration(parentElement) {
    const topLevel = parentElement.closest(".comment-content, .inline-comment");
    if (!topLevel) return;
    topLevel.classList.remove("heb", "en");
    const containsHolyLetters = isFirstCharacterHebrew(parentElement.innerText);
    topLevel.classList.add(containsHolyLetters ? "heb" : "en");
}

/**
 * Transforms a body element by filling it with comment content.
 * @param {Object} comment Raw comment.
 * @param {HTMLElement} parentElement Body stage.
 * @returns {void}
 */
export function populateCommentElement(comment, parentElement) {
    if (!comment || !parentElement) return;
    parentElement.innerHTML = "";
    const data = markSharedCardBody(parentElement, preserveLegacyTitle(cloneComment(comment)));

    if (data.dayuh?.conversation && Array.isArray(data.dayuh.conversation)) {
        renderBranchingThread(parentElement, data, comment.id, { isInline: data.__awtsmoosSharedCardBody });
    } else {
        renderStandardComment(parentElement, data);
    }

    synchronizeLinguisticVibration(parentElement);
}
