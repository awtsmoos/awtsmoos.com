
/**
 * B"H
 * @module VesselArchitect
 * @chapter Creating the physical sanctuaries.
 * @description
 * The Awtsmoos gives each verse a body, each subsection a chamber, and each
 * verse-level inline comment a final courtyard after all chambers have passed.
 */

import { sanitizeContent, appendHTML, isFirstCharacterHebrew } from "/heichelos/post/postFunctions.js";
import { UniversalInterpreter } from "/heichelos/post/logic/scribe/UniversalInterpreter.js";
import { SidebarConduit } from "/heichelos/post/ui/sidebar/Conduit.js";

function makeVerseEnd(index) {
    const end = document.createElement("div");
    end.className = "awtsmoos-verse-inline-end";
    end.dataset.awtsmoosVerseEnd = String(index);
    end.setAttribute("data-awtsmoos-verse-end", String(index));
    return end;
}

export class VesselArchitect {
    /**
     * Manifests one verse section with stable subsection and verse-end anchors.
     * @param {{data: object, index: number}} item Section source item.
     * @returns {Promise<HTMLDivElement>} Rendered section.
     */
    static async manifestSection(item) {
        const { data, index } = item;
        const { flatText, dynamicContent } = UniversalInterpreter.decipher(data);
        const sectionEl = document.createElement("div");
        sectionEl.className = "section";
        sectionEl.dataset.idx = index;
        sectionEl.dataset.awtsmoosIdx = index;
        sectionEl.appendChild(this.forgeHeader(data, index));

        const body = document.createElement("div");
        body.className = "toichen";
        sectionEl.appendChild(body);

        if (flatText) appendHTML(sanitizeContent(flatText), body);
        if (dynamicContent) body.appendChild(this.weaveSubSections(dynamicContent, index));
        sectionEl.appendChild(makeVerseEnd(index));

        const langClass = isFirstCharacterHebrew(body.innerText) ? "heb" : "en";
        sectionEl.classList.add(langClass);
        return sectionEl;
    }

    /**
     * Creates the clickable verse header.
     * @param {object} data Verse data.
     * @param {number} index Verse index.
     * @returns {HTMLDivElement} Header element.
     */
    static forgeHeader(data, index) {
        const hdr = document.createElement("div");
        hdr.className = "awtsmoos-section-header";
        const num = document.createElement("div");
        num.className = "awtsmoos-verse-number portal-revealer";
        num.textContent = data.verseSection !== undefined && data.verseSection !== null ? data.verseSection : index + 1;
        num.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            SidebarConduit.openChamber({ idx: index });
        });
        hdr.appendChild(num);
        return hdr;
    }

    /**
     * Renders subsection chambers with stable data coordinates.
     * @param {Array<string|{text: string}>} list Dynamic subsection list.
     * @param {number} sectionIndex Verse index.
     * @returns {HTMLDivElement} Subsection wrapper.
     */
    static weaveSubSections(list, sectionIndex) {
        const subWrap = document.createElement("div");
        subWrap.className = "awtsmoos-subsection-wrap toichen";
        if (!Array.isArray(list)) return subWrap;

        list.forEach((sub, sIdx) => {
            const txt = typeof sub === "string" ? sub : sub.text;
            if (!txt) return;
            const subEl = document.createElement("div");
            subEl.className = `sub-awtsmoos ${isFirstCharacterHebrew(txt) ? "heb" : "en"}`;
            subEl.dataset.awtsmoosIdx = sectionIndex;
            subEl.dataset.awtsmoosSub = sIdx;
            appendHTML(sanitizeContent(txt), subEl);
            subWrap.appendChild(subEl);
        });
        return subWrap;
    }
}
