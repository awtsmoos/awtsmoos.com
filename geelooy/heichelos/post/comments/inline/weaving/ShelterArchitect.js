/**
 * B"H
 * @module ShelterArchitect
 * @chapter Constructing the Marginal Tabernacle
 * @description
 * Builds a stable, visible, polished host for inline comments. The shelter also
 * exposes small status helpers so the toggle path can show loading/empty/error
 * states instead of silently doing nothing.
 */

const SHELTER_STYLE = [
    "display:flex",
    "flex-direction:column",
    "gap:14px",
    "visibility:visible",
    "opacity:1",
    "margin:22px 0 26px",
    "padding:18px",
    "border-radius:28px",
    "background:linear-gradient(145deg, rgba(15,23,42,.05), rgba(59,130,246,.07))",
    "border:1px solid rgba(100,116,139,.18)",
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.55), 0 18px 45px rgba(15,23,42,.10)",
    "position:relative",
    "clear:both"
].join(";");

function ensureIntro(shelter) {
    let intro = shelter.querySelector(':scope > .awtsmoos-inline-shelter-label');
    if (intro) return intro;

    intro = document.createElement('div');
    intro.className = 'awtsmoos-inline-shelter-label awtsmoos-student-location';
    intro.textContent = 'Inline commentary';
    intro.style.cssText = [
        "font-size:12px",
        "font-weight:900",
        "letter-spacing:.12em",
        "text-transform:uppercase",
        "color:#475569",
        "display:flex",
        "align-items:center",
        "gap:8px"
    ].join(";");
    shelter.prepend(intro);
    return intro;
}

export class ShelterArchitect {
    static secureShelter(vessel) {
        if (!vessel) return null;

        let shelter = Array.from(vessel.children).find(c =>
            c.classList.contains("marginal-gloss-shelter")
        );

        if (!shelter) {
            shelter = document.createElement("aside");
            shelter.className = "marginal-gloss-shelter awtsmoos-inline-shelter-v2";
            vessel.appendChild(shelter);
        }

        shelter.style.cssText = SHELTER_STYLE;
        shelter.setAttribute('aria-live', 'polite');
        ensureIntro(shelter);
        return shelter;
    }

    static setStatus(shelter, message, kind = "info") {
        if (!shelter) return null;
        let status = shelter.querySelector(':scope > .awtsmoos-inline-status');
        if (!status) {
            status = document.createElement('div');
            status.className = 'awtsmoos-inline-status awtsmoos-empty-placeholder';
            shelter.appendChild(status);
        }
        status.dataset.kind = kind;
        status.textContent = message;
        status.style.cssText = [
            "padding:12px 14px",
            "border-radius:16px",
            "font-size:13px",
            "font-weight:800",
            "line-height:1.45",
            kind === "error" ? "background:rgba(254,226,226,.92);color:#991b1b;border:1px solid rgba(239,68,68,.28)" :
            kind === "empty" ? "background:rgba(241,245,249,.92);color:#475569;border:1px solid rgba(148,163,184,.28)" :
            "background:rgba(219,234,254,.92);color:#1e3a8a;border:1px solid rgba(59,130,246,.24)"
        ].join(";");
        return status;
    }

    static clearStatus(shelter) {
        shelter?.querySelector(':scope > .awtsmoos-inline-status')?.remove();
    }
}
