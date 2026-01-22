//B"H
/**
 * @file scribe.js
 * @description 
 * The Scribe is the master of recursive manifestation. It takes the layered 
 * structure of the Dayuh and weaves it into the physical DOM. 
 * Every array of arrays, every object, and every string is accounted for.
 * 
 * NO LOGIC CUT. NO CORNERS SKIPPED.
 */

import { sanitizeContent, appendHTML, isFirstCharacterHebrew } from "../functions/utils.js";
import { weaveDropdownFromAwtsmoos, initializeFootnotes } from "../functions/interaction.js";

/**
 * @method mapSectionData
 * @description Standardizes various data patterns from the higher worlds.
 */
function mapSectionData(sec) {
    if (sec?.subSections || sec?.paragraphs || Array.isArray(sec)) {
        return sec;
    } else {
        return sec?.text || sec;
    }
}

/**
 * @method interpretPostDayuh
 * @description Parses the sections of the post and generates the DOM structure.
 */
export async function interpretPostDayuh(post) {
    console.log("B\"H - [Scribe] interpretPostDayuh: Engaging.");
    const dayuh = post?.dayuh;
    if (!dayuh || typeof dayuh !== "object") return null;

    const rawSections = dayuh.sections;
    if (!rawSections) return;

    window.sectionDayuh = [];
    window.sectionData = [];

    const realPost = document.getElementById("realPost");
    if (!realPost) return;

    // The Scribe clears the parchment
    realPost.innerHTML = "";

    // Manifest the title if it wasn't already manifest
    if (!document.querySelector(".post-title")) {
        const hd = document.createElement("div");
        hd.classList.add("post-title");
        const seriesName = window.series?.prateem?.name || "Sacred Series";
        const pt = document.createElement("div");
        pt.textContent = post.title || "Untitled Revelation";
        hd.appendChild(pt);
        realPost.appendChild(hd);
    }

    // Normalize into an array of sections
    let sections = Array.isArray(rawSections) ? rawSections : Object.values(rawSections);
    
    // Account for complex section objects
    if (sections.length > 0 && typeof sections[0] === "object") {
        sections = sections.map(mapSectionData);
    }

    let sectionCounter = 0;
    for (let i = 0; i < sections.length; i++) {
        const item = sections[i];
        if (item === null || item === undefined) continue;

        // Logic check: Is this a multi-layered section (Array of arrays, objects with paragraph keys)?
        const isMulti = (item?.subSections || item?.paragraphs) || Array.isArray(item);

        const manifestResult = await generateSection({
            sectionText: !isMulti && typeof item === 'string' ? item : null,
            dynamic: isMulti ? item : null,
            sectionId: sectionCounter, 
            allSections: sections,
            data: item 
        });

        if (manifestResult) {
            sectionCounter++;
        }
    }
    
    // Conclude Scribal work
    window.sections = Array.from(document.querySelectorAll(".section"));
    initializeFootnotes();
    
    const inlineModule = await import("../comments/inline.js");
    if (inlineModule.manifestCommentIndicators) {
        await inlineModule.manifestCommentIndicators();
    }

    // Refresh highlighting engine bounds
    if (window.chai) window.chai.updateParagraphs();
    if (window.subChai) window.subChai.updateParagraphs();
}

/**
 * @method generateSection
 * @description Forges a singular Verse Vessel (.section). 
 * Every internal division is targetable as a .sub-awtsmoos.
 */
export async function generateSection({sectionText, sectionId, dynamic=null, allSections, data}) {
    const i = sectionId;
    const vs = data?.verseSection;
    
    const sectionEl = document.createElement("div");
    sectionEl.className = "section";
    sectionEl.dataset.awtsmoosIdx = i;
    sectionEl.dataset.idx = i; // Compatibility with legacy highlighters

    // 1. Manifest Section Header (Number + Menu)
    const header = document.createElement("div");
    header.className = "awtsmoos-section-header";
    sectionEl.appendChild(header);

    const verseNum = document.createElement("div");
    verseNum.className = "awtsmoos-verse-number";
    verseNum.textContent = (vs !== undefined && vs !== null) ? vs : (i + 1);
    
    // Bind interaction dropdown
    verseNum.addEventListener('click', () => {
        const actions = {
            Share: async () => {
                const url = new URL(window.location);
                url.searchParams.set("idx", i);
                if (navigator.share) navigator.share({ title: 'Verse', url: url.href });
                else navigator.clipboard.writeText(url.href);
            },
            Comment: async () => {
                const { updateQueryStringParameter } = await import("../functions/utils.js");
                updateQueryStringParameter("idx", i);
                if(window.openPanelToComments) window.openPanelToComments();
            }
        };
        weaveDropdownFromAwtsmoos(header, actions);
    });
    header.appendChild(verseNum);
    
    // Section Bookmark
    const bookmark = document.createElement("button");
    bookmark.className = "bookmark-btn";
    bookmark.dataset.idx = i;
    bookmark.innerHTML = "B";
    sectionEl.appendChild(bookmark);

    const contentArea = document.createElement("div");
    contentArea.classList.add("toichen");
    contentArea.dataset.awtsmoosTextId = `text-${i}`;
    
    // 2. Manifest Content
    // Case A: Flat String
    if (sectionText) {
        appendHTML(sanitizeContent(sectionText), contentArea);
        window.sectionDayuh[i] = sectionText;
    }

    // Case B: Recursive Expanse (Arrays/Objects)
    if (dynamic) {
        const subContainer = document.createElement("div");
        subContainer.className = "subsection-container";
        const internalTextStack = [];
        let subCounter = 0;

        // Recursive processor to handle Arrays of Arrays and nested objects
        const processSubLayer = (item) => {
            if (Array.isArray(item)) {
                item.forEach(processSubLayer);
                return;
            }

            const txt = typeof item === "string" ? item : item?.text;
            if (typeof txt !== "string" || !txt.trim()) return;

            const subVessel = document.createElement("div");
            subVessel.dataset.awtsmoosSub = subCounter;
            subVessel.dataset.idx = subCounter; // Required for interaction sync
            subVessel.classList.add("sub-awtsmoos"); 
            subVessel.classList.add(isFirstCharacterHebrew(txt) ? "heb" : "eng");

            const subBody = document.createElement("div");
            subBody.className = "sub-toichen";
            subBody.dataset.awtsmoosTextId = `text-${i}-${subCounter}`;
            
            appendHTML(sanitizeContent(txt), subBody);
            subVessel.appendChild(subBody);

            subContainer.appendChild(subVessel);
            internalTextStack.push(txt);
            subCounter++;
        };

        // Normalize collection sources
        let collection = [];
        if (Array.isArray(dynamic)) collection = dynamic;
        else if (dynamic?.paragraphs) collection = dynamic.paragraphs;
        else if (dynamic?.subSections) collection = dynamic.subSections;

        collection.forEach(processSubLayer);
        contentArea.appendChild(subContainer);
        window.sectionDayuh[i] = internalTextStack;
    }

    // 3. Finalize Vessel
    if (isFirstCharacterHebrew(contentArea.innerText)) sectionEl.classList.add("heb");
    else sectionEl.classList.add("eng");

    // Existence check
    if (!contentArea.innerText.trim().length && !contentArea.querySelector('img')) {
        return false;
    }

    sectionEl.appendChild(contentArea);
    document.getElementById("realPost").appendChild(sectionEl);
    return true;
}