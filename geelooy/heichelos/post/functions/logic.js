//B"H
import { sanitizeContent, appendHTML, isFirstCharacterHebrew } from "./utils.js";
import { weaveDropdownFromAwtsmoos, initializeFootnotes } from "./interaction.js";

/**
 * Interprets the dayuh (data) of a post and generates the DOM.
 * Dedicated to the Awtsmoos who reveals the depth of every letter.
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

    const hd = document.createElement("div");
    hd.classList.add("post-title");

    const seriesName = window.series?.prateem?.name || "Series";
    const ser = document.createElement("a");
    ser.classList.add("series-name");
    ser.href = `/heichelos/${post.heichel?.id}/?view=posts&series=${window.series?.id}`;
    ser.textContent = seriesName + ": ";
    hd.appendChild(ser);

    const pt = document.createElement("div");
    pt.textContent = post.title || "Untitled";
    hd.appendChild(pt);
    realPost.appendChild(hd);

    let visibleSectionCount = 0; 
    
    for (let i = 0; i < secArray.length; i++) {
        const sectionRaw = secArray[i];
        if (!sectionRaw) continue;

        let content = sectionRaw;
        if (typeof sectionRaw === "object" && !Array.isArray(sectionRaw)) {
            content = sectionRaw.subSections || sectionRaw.paragraphs || sectionRaw.text || sectionRaw;
        }

        const isMulti = Array.isArray(content) || (content?.subSections || content?.paragraphs);

        const generated = await generateSection({
            sectionText: !isMulti && typeof content === 'string' ? content : null,
            dynamic: isMulti ? content : null,
            sectionId: visibleSectionCount, 
            data: sectionRaw 
        });

        if (generated) {
            visibleSectionCount++;
        }
    }
    
    window.sections = Array.from(document.querySelectorAll(".section"));
    initializeFootnotes();
    
    // B"H - Discovery Phase: Must await the manifestation of flames.
    const inlineModule = await import("../comments/inline.js");
    if (inlineModule.manifestCommentIndicators) {
        await inlineModule.manifestCommentIndicators();
    }

    // Refresh highlighters once content is fully manifested
    if (window.chai) window.chai.updateParagraphs();
    if (window.subChai) window.subChai.updateParagraphs();
}

/**
 * Generates a specific section of the post.
 * @method generateSection
 */
export async function generateSection({sectionText, sectionId, dynamic=null, data}) {
    const hasText = typeof sectionText === 'string' && sectionText.trim().length > 0;
    
    const hasDynamic = dynamic && (
        (Array.isArray(dynamic) && dynamic.length > 0) ||
        (Array.isArray(dynamic.paragraphs) && dynamic.paragraphs.length > 0) || 
        (Array.isArray(dynamic.subSections) && dynamic.subSections.length > 0)
    );

    if (!hasText && !hasDynamic) return false;

    const i = sectionId;
    const vs = data?.verseSection;
    
    const sectionInfo = {
        sectionId: i,
        verseSection: vs,
        hideVerseNumber: data?.hideVerseNumber,
        hasVerseNumber: (vs !== undefined && vs !== null)
    };
    
    window.sectionData[i] = sectionInfo;
    
    const el = document.createElement("div");
    el.className = "section";
    el.dataset.awtsmoosIdx = i; 

    const hdr = document.createElement("div");
    hdr.className = "awtsmoos-section-header";
    el.appendChild(hdr);

    const nm = document.createElement("div");
    nm.className = "awtsmoos-verse-number";
    if (data?.hideVerseNumber) {
        nm.classList.add("hidden");
    } else {
        nm.addEventListener('click', () => weaveDropdownFromAwtsmoos(hdr));
    }
    nm.textContent = (vs !== undefined && vs !== null) ? vs : (i + 1);
    hdr.appendChild(nm);

    // B"H - Indicator for Verse-level comments
    const indicator = document.createElement("div");
    indicator.className = "awtsmoos-comment-indicator";
    indicator.dataset.idx = i;
    hdr.appendChild(indicator);

    const contentArea = document.createElement("div");
    contentArea.classList.add("toichen");
    
    if (hasText) {
        if (isFirstCharacterHebrew(sectionText)) contentArea.classList.add("heb");
        appendHTML(sanitizeContent(sectionText), contentArea);
        window.sectionDayuh[i] = sectionText;
    }

    if (hasDynamic) {
        const sectionDiv = document.createElement("div");
        const secInternalText = [];
        let localSubCount = 0;

        const processSub = (subItem) => {
            const subS = document.createElement("div");
            const txt = typeof subItem === "string" ? subItem : subItem?.text;
            if (typeof txt !== "string" || !txt.trim()) return;
            
            subS.dataset.awtsmoosSub = localSubCount;
            subS.classList.add("sub-awtsmoos");
            
            const subTextContent = document.createElement("div");
            subTextContent.className = "sub-toichen";
            appendHTML(sanitizeContent(txt), subTextContent);
            subS.appendChild(subTextContent);

            // B"H - Sub-indicator: Manifest BENEATH the text content
            const subIndicator = document.createElement("div");
            subIndicator.className = "awtsmoos-comment-indicator sub-indicator";
            subS.appendChild(subIndicator);

            sectionDiv.appendChild(subS);
            secInternalText.push(txt);
            localSubCount++;
        };

        if (Array.isArray(dynamic)) {
            dynamic.forEach(processSub);
        } else {
            if (Array.isArray(dynamic.paragraphs)) dynamic.paragraphs.forEach(processSub);
            if (Array.isArray(dynamic.subSections)) dynamic.subSections.forEach(processSub);
        }

        contentArea.appendChild(sectionDiv);
        
        if (window.sectionDayuh[i]) {
            const current = Array.isArray(window.sectionDayuh[i]) ? window.sectionDayuh[i] : [window.sectionDayuh[i]];
            window.sectionDayuh[i] = [...current, ...secInternalText];
        } else {
            window.sectionDayuh[i] = secInternalText;
        }
        
        if (isFirstCharacterHebrew(contentArea.innerText)) {
            contentArea.classList.add("heb");
        }
    }

    el.appendChild(contentArea);
    document.getElementById("realPost").appendChild(el);
    return true;
}
