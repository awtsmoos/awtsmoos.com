
import { weaveParagraphs } from "./ParagraphWeaver.js";

/**
 * B"H
 * @module VesselFactory
 * @description 
 * Creating the heavens and the earth was the creation of space. 
 * This factory creates the space for the Revelation to exist.
 */

/**
 * @function createSectionVessel
 * @description Forges the DOM structure for a full post section.
 * @param {Object} normalizedSection - { id, type, paragraphs }
 * @returns {HTMLElement} - The manifest vessel.
 */
export function createSectionVessel(normalizedSection) {
    const { id, type, paragraphs } = normalizedSection;

    const vessel = document.createElement("div");
    vessel.className = `section-vessel section-type-${type.toLowerCase()}`;
    vessel.dataset.awtsmoosIdx = id;

    // B"H - The Floating Sigil (Verse Number)
    const sigil = document.createElement("div");
    sigil.className = "awtsmoos-sigil-verse";
    sigil.textContent = id + 1;
    vessel.appendChild(sigil);

    // B"H - The Bookmark Action
    const bookmark = document.createElement("button");
    bookmark.className = "sigil-bookmark";
    bookmark.innerHTML = "<span>🔖</span>";
    bookmark.title = "Anchor this spark";
    bookmark.dataset.targetIdx = id;
    vessel.appendChild(bookmark);

    // B"H - The Main Content Area
    const mainArea = document.createElement("div");
    mainArea.className = "toichen-container";
    
    const wovenContent = weaveParagraphs(paragraphs, id);
    mainArea.appendChild(wovenContent);

    vessel.appendChild(mainArea);

    return vessel;
}
