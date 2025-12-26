//B"H
/**
 * Post Content Logic - The Interpreter of Dayuh.
 * Refined for the Divine Neo-Brutalist Architecture.
 */
import { sanitizeContent, appendHTML, isFirstCharacterHebrew } from "./utils.js";
import { weaveDropdownFromAwtsmoos, initializeFootnotes } from "./interaction.js";

/**
 * Interprets the dayuh (data) of a post and generates the DOM.
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

    const seriesName = window.series?.prateem?.name || "Sacred Series";
    const ser = document.createElement("a");
    ser.classList.add("series-name");
    ser.href = `/heichelos/${post.heichel?.id}/?view=posts&series=${window.series?.id}`;
    ser.textContent = seriesName;
    hd.appendChild(ser);

    const pt = document.createElement("div");
    pt.textContent = post.title || "Untitled Revelation";
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

        if (generated) visibleSectionCount++;
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
 * Generates a specific section with AUTOMATIC direction detection.
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
    
    const el = document.createElement("div");
    el.className = "section";
    el.dataset.awtsmoosIdx = i; 

    // B"H - First Character Audit for Direction
    const sample = sectionText || (Array.isArray(dynamic) ? (typeof dynamic[0] === 'string' ? dynamic[0] : dynamic[0]?.text) : null) || "";
    el.classList.add(isFirstCharacterHebrew(sample) ? "heb" : "eng");

    const hdr = document.createElement("div");
    hdr.className = "awtsmoos-section-header";
    el.appendChild(hdr);

    const nm = document.createElement("div");
    nm.className = "awtsmoos-verse-number";
    if (!data?.hideVerseNumber) {
        nm.addEventListener('click', (e) => {
            e.stopPropagation();
            weaveDropdownFromAwtsmoos(hdr);
        });
    } else nm.classList.add("hidden");
    nm.textContent = (vs !== undefined && vs !== null) ? vs : (i + 1);
    hdr.appendChild(nm);

    const indicator = document.createElement("div");
    indicator.className = "awtsmoos-comment-indicator";
    indicator.dataset.idx = i;
    hdr.appendChild(indicator);

    const contentArea = document.createElement("div");
    contentArea.classList.add("toichen");
    
    if (hasText) {
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
            subS.classList.add(isFirstCharacterHebrew(txt) ? "heb" : "eng");

            const subTextContent = document.createElement("div");
            subTextContent.className = "sub-toichen";
            appendHTML(sanitizeContent(txt), subTextContent);
            subS.appendChild(subTextContent);

            const subIndicator = document.createElement("div");
            subIndicator.className = "awtsmoos-comment-indicator sub-indicator";
            
            const quickBtn = document.createElement("button");
            quickBtn.className = "btn secondary small";
            quickBtn.innerHTML = "INSIGHTS +";
            quickBtn.style.padding = "4px 8px";
            quickBtn.onclick = async (e) => {
                e.stopPropagation();
                const { showSectionCommentaryInline } = await import("../comments/inline.js");
                await showSectionCommentaryInline(i, localSubCount, subS);
            };
            subIndicator.appendChild(quickBtn);
            subS.appendChild(subIndicator);

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

    el.appendChild(contentArea);
    document.getElementById("realPost").appendChild(el);
    return true;
}