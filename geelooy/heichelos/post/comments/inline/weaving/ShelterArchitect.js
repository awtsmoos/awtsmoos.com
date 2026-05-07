
/**
 * B"H
 * @module ShelterArchitect
 * @chapter Constructing the Marginal Tabernacle
 * @description
 * Every physical Verse is a Vessel. To hold the 'Marginalia', we 
 * must construct a Shelter. This architect ensures the shelter 
 * is properly manifested and styled.
 * 
 * We enforce absolute visibility using inline styles so no external 
 * CSS can accidentally hide the Light.
 */

export class ShelterArchitect {
    /**
     * @method secureShelter
     * @description Finds or builds the 'marginal-gloss-shelter' for a verse.
     * 
     * @param {HTMLElement} vessel - The Verse/Section DOM element.
     * @returns {HTMLElement} - The manifest shelter.
     */
    static secureShelter(vessel) {
        if (!vessel) return null;

        // B"H - Look for an existing sanctuary.
        let shelter = Array.from(vessel.children).find(c => 
            c.classList.contains("marginal-gloss-shelter")
        );

        // B"H - If none exists, forge one from the physical materials.
        if (!shelter) {
            shelter = document.createElement("div");
            shelter.className = "marginal-gloss-shelter";
            
            // B"H - Brute Force Visibility
            // We ensure it is a flex column and absolutely visible to the eye.
            shelter.style.cssText = "display: flex !important; flex-direction: column !important; visibility: visible !important; opacity: 1 !important;";
            vessel.appendChild(shelter);
        }

        return shelter;
    }
}
