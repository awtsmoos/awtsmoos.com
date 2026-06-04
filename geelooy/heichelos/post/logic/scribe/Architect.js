// B"H
/**
 * @module VesselArchitect
 * @description
 * Chapter 225: One verse, many baby chambers, one small DOM window.
 * The Awtsmoos holds every subsection in memory, but the verse body receives a
 * moving subsection window rather than a full list of children. Whole verses
 * still sleep by chunk; baby sections now sleep inside their verse.
 */

import { sanitizeContent, appendHTML, isFirstCharacterHebrew } from "/heichelos/post/postFunctions.js";
import { UniversalInterpreter } from "/heichelos/post/logic/scribe/UniversalInterpreter.js";
import { SidebarConduit } from "/heichelos/post/ui/sidebar/Conduit.js";
import { makeVirtualSubsectionWindow } from "/heichelos/post/logic/scribe/SubsectionVirtualizer.js";

function makeVerseEnd(index) {
    const end = document.createElement("div");
    end.className = "awtsmoos-verse-inline-end";
    end.dataset.awtsmoosVerseEnd = String(index);
    end.setAttribute("data-awtsmoos-verse-end", String(index));
    return end;
}

function rawTextOf(sub) {
    if (typeof sub === "string") return sub;
    if (sub?.text) return sub.text;
    if (sub?.content) return sub.content;
    if (sub?.html) return sub.html;
    if (sub?.body) return sub.body;
    return "";
}

function targetSubFor(sectionIndex) {
    const params = new URLSearchParams(location.search);
    const idx = Number.parseInt(params.get("idx") || "0", 10);
    if (idx !== sectionIndex) return null;
    const sub = Number.parseInt(params.get("sub") || "", 10);
    return Number.isFinite(sub) ? sub : null;
}

function firstTextForLanguage(flatText, dynamicContent, data) {
    if (flatText) return flatText;
    if (Array.isArray(dynamicContent) && dynamicContent.length) return rawTextOf(dynamicContent[0]);
    const pure = UniversalInterpreter.extractPureText(data);
    return Array.isArray(pure) ? pure.find(Boolean) || "" : pure;
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
        sectionEl.dataset.idx = String(index);
        sectionEl.dataset.awtsmoosIdx = String(index);
        sectionEl.appendChild(this.forgeHeader(data, index));

        const body = document.createElement("div");
        body.className = "toichen";
        sectionEl.appendChild(body);

        if (Array.isArray(dynamicContent) && dynamicContent.length) {
            body.appendChild(this.weaveSubSections(dynamicContent, index));
        } else if (flatText) {
            appendHTML(sanitizeContent(flatText), body);
        }

        sectionEl.appendChild(makeVerseEnd(index));
        const langClass = isFirstCharacterHebrew(firstTextForLanguage(flatText, dynamicContent, data)) ? "heb" : "en";
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
        num.textContent = data?.verseSection !== undefined && data?.verseSection !== null ? data.verseSection : index + 1;
        num.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            SidebarConduit.openChamber({ idx: index });
        });
        hdr.appendChild(num);
        return hdr;
    }

    /**
     * Renders one moving window for many subsection chambers.
     * @param {Array<string|{text: string}>} list Dynamic subsection list.
     * @param {number} sectionIndex Verse index.
     * @returns {HTMLDivElement} Subsection wrapper.
     */
    static weaveSubSections(list, sectionIndex) {
        const texts = Array.isArray(list) ? list.map(rawTextOf).filter(Boolean) : [];
        return makeVirtualSubsectionWindow(texts, sectionIndex, targetSubFor(sectionIndex));
    }
}
