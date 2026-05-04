
/**
 * B"H
 * @module ShelterFactory
 * @chapter Forging the Tabernacle
 * @description
 * Every Verse (Section) is a holy vessel. To contain the insights 
 * without overwhelming the reader, we create a 'Shelter' (Marginal Gloss Shelter).
 * This factory ensures the shelter exists and is properly styled 
 * to receive the Divine Light of commentary.
 */

export class ShelterFactory {
    /**
     * @method establishShelter
     * @description
     * Finds or creates the physical container for marginalia within a verse.
     * 
     * @param {HTMLElement} targetVessel - The Verse/Section element.
     * @returns {HTMLElement} - The manifest shelter.
     */
    static establishShelter(targetVessel) {
        if (!targetVessel) return null;

        let shelter = null;
        for (const child of targetVessel.children) {
            if (child.classList.contains("marginal-gloss-shelter")) {
                shelter = child;
                break;
            }
        }

        if (!shelter) {
            shelter = document.createElement("div");
            shelter.className = "marginal-gloss-shelter";
            
            // B"H - Force the display to ensure visibility
            shelter.style.setProperty("display", "flex", "important");
            targetVessel.appendChild(shelter);
        }

        return shelter;
    }
}
