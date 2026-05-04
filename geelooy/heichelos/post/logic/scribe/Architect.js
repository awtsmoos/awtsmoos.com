
/**
 * B"H
 * @module VesselArchitect
 * @chapter Creating the physical sanctuaries.
 */

import { sanitizeContent, appendHTML, isFirstCharacterHebrew } from "/heichelos/post/postFunctions.js";
import { UniversalInterpreter } from "/heichelos/post/logic/scribe/UniversalInterpreter.js";
import { SidebarConduit } from "/heichelos/post/ui/sidebar/Conduit.js";

export class VesselArchitect {
    /** @method manifestSection */
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
        if (dynamicContent) {
            body.appendChild(this.weaveSubSections(dynamicContent, index));
        }

        const langClass = isFirstCharacterHebrew(body.innerText) ? "heb" : "en";
        sectionEl.classList.add(langClass);

        return sectionEl;
    }

    /** @method forgeHeader */
    static forgeHeader(data, index) {
        const hdr = document.createElement("div");
        hdr.className = "awtsmoos-section-header";
        
        const num = document.createElement("div");
        num.className = "awtsmoos-verse-number portal-revealer";
        const label = (data.verseSection !== undefined && data.verseSection !== null) ? data.verseSection : (index + 1);
        num.textContent = label;
        
        // B"H - Sigil Portal Click
        num.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            console.log(`B"H - Sigil Portal Clicked for Verse ${index}. Calling Conduit.`);
            SidebarConduit.openChamber({ idx: index });
        });

        hdr.appendChild(num);
        return hdr;
    }

    /** @method weaveSubSections */
    static weaveSubSections(list, sectionIndex) {
        const subWrap = document.createElement("div");
        subWrap.className = "awtsmoos-subsection-wrap";
        if (!Array.isArray(list)) return subWrap;

        list.forEach((sub, sIdx) => {
            const txt = (typeof sub === 'string') ? sub : sub.text;
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
