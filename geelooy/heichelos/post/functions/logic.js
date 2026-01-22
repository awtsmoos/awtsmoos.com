//B"H
/**
 * Post Content Logic - The Interpreter of Dayuh.
 * Refined for the Divine Neo-Brutalist Architecture.
 * Specifically engineered to handle recursive sub-sections and complex array structures.
 * Dedicated to the Awtsmoos who provides the depth within the breadth.
 */
import { sanitizeContent, appendHTML, isFirstCharacterHebrew } from "./utils.js";
import { weaveDropdownFromAwtsmoos, initializeFootnotes } from "./interaction.js";

/**
 * @method interpretPostDayuh
 * @description B"H - Iterates through the post's dayuh and manifests the textual vessels.
 * Handles strings, arrays of strings, and arrays of arrays.
 */
export async function interpretPostDayuh(post) {
    const dayuh = post?.dayuh;
    if (!dayuh || typeof dayuh !== "object") return null;

    window.sectionDayuh = [];
    window.sectionData = [];

    const rawSections = dayuh.sections;
    if (!rawSections) return;

    const secArray = Array.isArray(rawSections) ? rawSections : Object.values(rawSections);
    
    const realPost = document.getElementById("realPost");
    if (!realPost) return;

    realPost.innerHTML = "";

    // --- Post Header ---
    const hd = document.createElement("div");
    hd.classList.add("post-title");
    if (isFirstCharacterHebrew(post.title)) hd.classList.add("heb");

    const seriesName = window.series?.prateem?.name || "Sacred Series";
    const ser = document.createElement("a");
    ser.classList.add("series-name");
    ser.href = `/heichelos/${post.heichel?.id}/?view=posts&series=${window.series?.id}`;
    ser.textContent = seriesName;
    hd.appendChild(ser);

    const pt = document.createElement("div");
    pt.textContent = post.title || "Untitled Revelation";
    hd.appendChild(pt);
    
    const postBookmarkBtn = document.createElement("button");
    postBookmarkBtn.className = "bookmark-btn";
    postBookmarkBtn.dataset.idx = 'title';
    postBookmarkBtn.innerHTML = "B";
    hd.appendChild(postBookmarkBtn);

    realPost.appendChild(hd);

    for (let i = 0; i < secArray.length; i++) {
        const sectionRaw = secArray[i];
        if (!sectionRaw) continue;

        // B"H - Standardize the "dynamic" content
        let content = sectionRaw;
        if (typeof sectionRaw === "object" && !Array.isArray(sectionRaw)) {
            content = sectionRaw.subSections || sectionRaw.paragraphs || sectionRaw.text || sectionRaw;
        }

        // If it's an array (including array of arrays), treat as multi-part
        const isMulti = Array.isArray(content) || (typeof content === 'object' && (content?.subSections || content?.paragraphs));

        await generateSection({
            sectionText: !isMulti && typeof content === 'string' ? content : null,
            dynamic: isMulti ? content : null,
            sectionId: i, 
            data: sectionRaw 
        });
    }
    
    window.sections = Array.from(document.querySelectorAll(".section"));
    initializeFootnotes();
    
    const inlineModule = await import("../comments/inline.js");
    if (inlineModule.manifestCommentIndicators) {
        await inlineModule.manifestCommentIndicators();
    }

    if (window.chai) window.chai.updateParagraphs();
    if (window.subChai) window.subChai.updateParagraphs();
}

/**
 * @method generateSection
 * @description B"H - Forges a single Verse-vessel. 
 * Every unit of text within a multi-part section is marked as a .sub-awtsmoos.
 */
export async function generateSection({sectionText, sectionId, dynamic=null, data}) {
    const i = sectionId;
    const vs = data?.verseSection;
    
    const el = document.createElement("div");
    el.className = "section";
    el.dataset.awtsmoosIdx = i; 

    const nm = document.createElement("div");
    nm.className = "awtsmoos-verse-number";
    nm.textContent = (vs !== undefined && vs !== null) ? vs : (i + 1);
    el.appendChild(nm);
    
    const verseBookmarkBtn = document.createElement("button");
    verseBookmarkBtn.className = "bookmark-btn";
    verseBookmarkBtn.dataset.idx = i;
    verseBookmarkBtn.innerHTML = "B";
    el.appendChild(verseBookmarkBtn);

    const contentArea = document.createElement("div");
    contentArea.classList.add("toichen");
    contentArea.dataset.awtsmoosTextId = `text-${i}`;
    
    if (sectionText) {
        appendHTML(sanitizeContent(sectionText), contentArea);
        window.sectionDayuh[i] = sectionText;
    }

    if (dynamic) {
        const sectionDiv = document.createElement("div");
        sectionDiv.className = "subsection-container";
        const secInternalText = [];
        let localSubCount = 0;

        const processSub = (subItem) => {
            const txt = typeof subItem === "string" ? subItem : subItem?.text;
            if (typeof txt !== "string" || !txt.trim()) return;

            const subS = document.createElement("div");
            subS.dataset.awtsmoosSub = localSubCount;
            subS.classList.add("sub-awtsmoos");
            subS.classList.add(isFirstCharacterHebrew(txt) ? "heb" : "eng");

            const subTextContent = document.createElement("div");
            subTextContent.className = "sub-toichen";
            subTextContent.dataset.awtsmoosTextId = `text-${i}-${localSubCount}`;
            appendHTML(sanitizeContent(txt), subTextContent);
            subS.appendChild(subTextContent);

            sectionDiv.appendChild(subS);
            secInternalText.push(txt);
            localSubCount++;
        };

        if (Array.isArray(dynamic)) dynamic.forEach(processSub);
        else {
            if (Array.isArray(dynamic.paragraphs)) dynamic.paragraphs.forEach(processSub);
            if (Array.isArray(dynamic.subSections)) dynamic.subSections.forEach(processSub);
        }
        contentArea.appendChild(sectionDiv);
        window.sectionDayuh[i] = secInternalText;
    }

    if (isFirstCharacterHebrew(contentArea.innerText)) el.classList.add("heb");
    else el.classList.add("eng");

    el.appendChild(contentArea);
    document.getElementById("realPost").appendChild(el);
    return true;
}