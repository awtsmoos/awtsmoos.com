
/**
 * B"H
 * @module ShelterArchitect
 * @chapter Forging the Marginal Sanctuary
 * @description
 * Every physical Verse in the scroll is a Vessel of light.
 * To contain the marginal insights (The Gloss), we must create a 
 * dedicated 'Shelter' within that vessel. This architect ensures 
 * the shelter is manifested and properly styled.
 * 
 * "And let them make for Me a sanctuary, that I may dwell among them."
 */

export class ShelterArchitect {
    /**
     * @method establishShelter
     * @description Finds or constructs the 'marginal-gloss-shelter' for a verse.
     * 
     * @param {HTMLElement} verseEl - The physical Verse DOM element.
     * @returns {HTMLElement} - The manifest shelter.
     */
    static establishShelter(verseEl) {
        if (!verseEl) return null;

        // B"H - Search for an existing shelter among the children.
        let shelter = Array.from(verseEl.children).find(child => 
            child.classList.contains("marginal-gloss-shelter")
        );

        // B"H - If none exists, manifest one from the void.
        if (!shelter) {
            shelter = document.createElement("div");
            shelter.className = "marginal-gloss-shelter";
            
            // B"H - Ensure it is visible within the layout.
            shelter.style.setProperty("display", "flex", "important");
            verseEl.appendChild(shelter);
        }

        return shelter;
    }
}
