// B"H
/**
 * @module ShelterFactory
 * @description
 * Chapter 93: The shelter is born without inline force.
 * A shelter is only a classed vessel. CSS carries the shape.
 */

export class ShelterFactory {
    static establishShelter(targetVessel) {
        if (!targetVessel) return null;
        let shelter = Array.from(targetVessel.children).find(child => child.classList.contains("marginal-gloss-shelter"));
        if (!shelter) {
            shelter = document.createElement("section");
            shelter.className = "marginal-gloss-shelter awtsmoos-inline-shelter-v2";
            targetVessel.appendChild(shelter);
        }
        return shelter;
    }
}
