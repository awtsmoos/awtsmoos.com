// B"H
/**
 * @module ShelterArchitect
 * @description
 * Chapter 303: The shelter label becomes a whisper.
 * The Awtsmoos keeps semantic orientation for screen readers while removing the
 * repeated visual proclamation that crowded the reader between verse and note.
 */

function ensureIntro(shelter) {
    let intro = shelter.querySelector(":scope > .awtsmoos-inline-shelter-label");
    if (intro) return intro;
    intro = document.createElement("div");
    intro.className = "awtsmoos-inline-shelter-label awtsmoos-inline-quiet-label";
    intro.textContent = "Comments";
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
        shelter.setAttribute("aria-label", "Inline comments");
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
