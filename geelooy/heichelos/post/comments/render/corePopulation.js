
/**
 * B"H
 * @module CorePopulationRitual
 * @chapter Filling the Hollow Shells
 * @description
 * Content is the soul; the element is the body. Without content, 
 * an element is a dry vessel. This module performs the 'Hislabshus' 
 * (Enclothement), wrapping the divine data (the comment) in the 
 * manifest form of the DOM.
 */

import { isFirstCharacterHebrew } from "../../functions/text/LinguisticSpeech.js";
import { renderBranchingThread } from "./ai/structure.js";
import { renderStandardComment } from "./standard.js";
import { makeTitleDiv } from "./utils.js";

/**
 * @function populateCommentElement
 * @description 
 * Transforms a physical element by filling it with the Light of an insight.
 * It intelligently chooses the manifestation path based on the data's vibration.
 * 
 * @param {Object} comment - The raw emanation from the server.
 * @param {HTMLElement} parentElement - The stage where manifestation occurs.
 */
export function populateCommentElement(comment, parentElement) {
    if (!comment || !parentElement) return;
    
    // Purify the existing reality to allow for fresh creation
    parentElement.innerHTML = '';
    
    // Create a local shadow to protect the original light
    let data = JSON.parse(JSON.stringify(comment));

    // Handle legacy 'title in content' scenarios
    if (data?.content?.title) {
        if (!data.dayuh) data.dayuh = {};
        data.dayuh.title = data.content.title;
    }

    // Manifest the Diadem (Title) if it exists
    if (data?.dayuh?.title) {
        parentElement.appendChild(makeTitleDiv(data.dayuh.title));
    }

    // PATH SELECTION:
    // If it contains a conversation, it is an AI Multi-Branching Revelation.
    if (data.dayuh && data.dayuh.conversation && Array.isArray(data.dayuh.conversation)) {
        renderBranchingThread(parentElement, data, comment.id);
    } 
    // Otherwise, it is the Standard Human transmission.
    else {
        renderStandardComment(parentElement, data);
    }

    // Sync the linguistic frequency for proper layout alignment
    synchronizeLinguisticVibration(parentElement);
}

/**
 * @private
 * @function synchronizeLinguisticVibration
 */
function synchronizeLinguisticVibration(parentElement) {
    const topLevel = parentElement.closest('.comment-content, .inline-comment');
    if (topLevel) {
        topLevel.classList.remove("heb", "en");
        const containsHolyLetters = isFirstCharacterHebrew(parentElement.innerText);
        topLevel.classList.add(containsHolyLetters ? "heb" : "en");
    }
}
