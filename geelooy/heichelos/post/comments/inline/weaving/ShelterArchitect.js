
/**
 * B"H
 * @module ShelterArchitect
 * @chapter Constructing the Marginal Tabernacle
 * @description
 * Every physical Verse is a Vessel. To hold the 'Marginalia', we 
 * must construct a Shelter. This architect ensures the shelter 
 * is properly manifested and styled.
 * 
 * "And they shall make for Me a sanctuary, that I may dwell among them."
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
            
            // B"H - Ensuring visibility in the realm of layout.
            shelter.style.setProperty("display", "flex", "important");
            vessel.appendChild(shelter);
        }

        return shelter;
    }
}
