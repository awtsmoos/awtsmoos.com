
/**
 * B"H
 * @module VesselArchitect
 * @chapter The physical manifestation from unified blueprints.
 */

import { 
    sanitizeContent, 
    appendHTML, 
    isFirstCharacterHebrew, 
    weaveDropdownFromAwtsmoos 
} from "../postFunctions.js";
import { UniversalInterpreter } from "./UniversalInterpreter.js";

export class VesselArchitect {
    /**
     * @method manifestSection
     */
    static async manifestSection(item) {
        const { data, index } = item;
        const { flatText, dynamicContent } = UniversalInterpreter.decipher(data);

        const sectionEl = document.createElement("div");
        sectionEl.className = "section";
        sectionEl.dataset.idx = index;
        sectionEl.dataset.awtsmoosIdx = index;

        const hdr = this.forgeHeader(data, index);
        sectionEl.appendChild(hdr);

        const body = document.createElement("div");
        body.className = "toichen";
        sectionEl.appendChild(body);

        if (flatText) {
            appendHTML(sanitizeContent(flatText), body);
        }

        if (dynamicContent) {
            const subWrap = this.weaveSubSections(dynamicContent, index);
            body.appendChild(subWrap);
        }

        if (isFirstCharacterHebrew(body.innerText)) {
            sectionEl.classList.add("heb");
        } else {
            sectionEl.classList.add("en");
        }

        return sectionEl;
    }

    /**
     * @private
     */
    static forgeHeader(data, index) {
        const hdr = document.createElement("div");
        hdr.className = "awtsmoos-section-header";
        
        const num = document.createElement("div");
        num.className = "awtsmoos-verse-number";
        const verseLabel = (data.verseSection !== undefined && data.verseSection !== null) 
            ? data.verseSection : (index + 1);
        num.textContent = verseLabel;
        
        num.addEventListener('click', async (e) => {
            e.stopPropagation();
            const { atzilusActions } = await import("../conductor.js"); 
            weaveDropdownFromAwtsmoos(hdr, atzilusActions || {});
        });

        hdr.appendChild(num);
        return hdr;
    }

    /**
     * @private
     */
    static weaveSubSections(list, sectionIndex) {
        const subWrap = document.createElement("div");
        subWrap.className = "awtsmoos-subsection-wrap";
        
        if (!Array.isArray(list)) return subWrap;

        list.forEach((subItem, sIdx) => {
            const txt = (typeof subItem === 'string') ? subItem : subItem.text;
            if (!txt) return;
            
            const subEl = document.createElement("div");
            const langClass = isFirstCharacterHebrew(txt) ? "heb" : "en";
            subEl.className = `sub-awtsmoos ${langClass}`;
            subEl.dataset.awtsmoosSub = sIdx;
            subEl.dataset.awtsmoosIdx = sectionIndex;
            subEl.dataset.idx = sIdx;
            
            appendHTML(sanitizeContent(txt), subEl);
            subWrap.appendChild(subEl);
        });
        
        return subWrap;
    }
}
