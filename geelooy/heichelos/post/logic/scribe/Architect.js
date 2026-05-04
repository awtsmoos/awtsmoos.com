
/**
 * B"H
 * @module VesselArchitect
 * @chapter Manifesting the physical reality.
 * @description
 * Responsible for creating each Verse (Section).
 * 
 * FIX: Clicking the Verse Number (the orange/yellow square) 
 * now specifically commands the SidebarConduit to open the Insights.
 */

import { 
     sanitizeContent, 
     appendHTML, 
     isFirstCharacterHebrew 
} from "../postFunctions.js";
import { UniversalInterpreter } from "./UniversalInterpreter.js";
import { SidebarConduit } from "../../ui/sidebar/Conduit.js";

export class VesselArchitect {
    /** @method manifestSection */
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

        const langClass = isFirstCharacterHebrew(body.innerText) ? "heb" : "en";
        sectionEl.classList.add(langClass);

        return sectionEl;
    }

    /** @method forgeHeader */
    static forgeHeader(data, index) {
        const hdr = document.createElement("div");
        hdr.className = "awtsmoos-section-header";
        
        // B"H - The Verse Sigil (Number/Arrow container)
        const num = document.createElement("div");
        num.className = "awtsmoos-verse-number open-sidebar-portal";
        const verseLabel = (data.verseSection !== undefined && data.verseSection !== null) 
             ? data.verseSection : (index + 1);
        num.textContent = verseLabel;
        
        // B"H - Command the sidebar revelation upon click.
        num.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`B"H - Sigil Clicked for Verse ${index}. Activating SidebarConduit.`);
            SidebarConduit.openInsights({ verseIdx: index });
        });

        hdr.appendChild(num);
        return hdr;
    }

    /** @method weaveSubSections */
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
