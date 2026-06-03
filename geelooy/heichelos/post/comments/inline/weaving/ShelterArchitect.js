// B"H
/**
 * @module ShelterArchitect
 * @description
 * Chapter 94: The inline shelter loses its inline costume.
 * The Awtsmoos makes shelter, label, and status plain DOM nodes. CSS alone
 * decides the visible garment, preventing old light-theme inline styles from
 * crushing the mobile reader.
 */

function ensureIntro(shelter) {
    let intro = shelter.querySelector(":scope > .awtsmoos-inline-shelter-label");
    if (intro) return intro;
    intro = document.createElement("div");
    intro.className = "awtsmoos-inline-shelter-label";
    intro.textContent = "Inline commentary";
    shelter.prepend(intro);
    return intro;
}

export class ShelterArchitect {
    static secureShelter(vessel) {
        if (!vessel) return null;
        let shelter = Array.from(vessel.children).find(child => child.classList.contains("marginal-gloss-shelter"));
        if (!shelter) {
            shelter = document.createElement("aside");
            shelter.className = "marginal-gloss-shelter awtsmoos-inline-shelter-v2";
            vessel.appendChild(shelter);
        }
        shelter.setAttribute("aria-live", "polite");
        ensureIntro(shelter);
        return shelter;
    }

    static setStatus(shelter, message, kind = "info") {
        if (!shelter) return null;
        let status = shelter.querySelector(":scope > .awtsmoos-inline-status");
        if (!status) {
            status = document.createElement("div");
            status.className = "awtsmoos-inline-status awtsmoos-empty-placeholder";
            shelter.appendChild(status);
        }
        status.dataset.kind = kind;
        status.textContent = message;
        return status;
    }

    static clearStatus(shelter) {
        shelter?.querySelector(":scope > .awtsmoos-inline-status")?.remove();
    }
}
