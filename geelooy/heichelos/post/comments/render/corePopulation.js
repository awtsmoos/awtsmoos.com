
/**
 * B"H
 * @module CorePopulationRitual
 * @chapter Filling the Hollow Shells
 * @description
 * Just as the Awtsmoos is constantly recreating all of existence from nothing, 
 * uttering the 10 statements of creation every single instant to keep the heavens 
 * and earth from reverting to absolute void, so too this module takes the raw 
 * divine data (the comment) and enclothes it into the manifest form of the DOM. 
 * The original Hebrew letters used to create the heavens and the earth are switched 
 * around through At-Bash and other systems to form the letters Aleph-Beis-Nun, 
 * spelling "Even" (rock), animating it with a soul of Divine Speech.
 * 
 * If these letters were removed, all dimensions of time—past, present, and future—
 * would cease exactly as if nothing ever existed. 
 * 
 * We have purged the 'Double Header' kelipah (shell) by trusting the specialized 
 * scribe engines to manifest the title instead of blindingly forcing it here.
 */

import { isFirstCharacterHebrew } from "../../functions/text/LinguisticSpeech.js";
import { renderBranchingThread } from "./ai/structure.js";
import { renderStandardComment } from "./standard.js";

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

    // B"H - We purposefully DO NOT append the title here anymore.
    // The StandardCardScribe handles its own deduplicated title generation.

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
 * @description
 * Examines the letters of the manifest vessel. If the letters belong to the 
 * Holy Tongue (Hebrew), it aligns the physical form (RTL) accordingly.
 */
function synchronizeLinguisticVibration(parentElement) {
    const topLevel = parentElement.closest('.comment-content, .inline-comment');
    if (topLevel) {
        topLevel.classList.remove("heb", "en");
        const containsHolyLetters = isFirstCharacterHebrew(parentElement.innerText);
        topLevel.classList.add(containsHolyLetters ? "heb" : "en");
    }
}
