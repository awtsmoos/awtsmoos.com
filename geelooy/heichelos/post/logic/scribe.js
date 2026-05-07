
/**
 * B"H
 * @module SovereignScribe
 * @chapter Creation from Nothing into Manifest Action
 * @description
 * This module is the physical manifestation of the Speech.
 * It builds the main text chunks dynamically and securely triggers 
 * the inline marginalia generation after the DOM settles.
 */

import { UniversalInterpreter } from "./scribe/UniversalInterpreter.js";
import { ScribeScaffold } from "./scribe/Scaffold.js";
import { VesselArchitect } from "./scribe/Architect.js";

let allSectionData =[];
let chunkMap = new Map();

/**
 * @function interpretPostDayuh
 */
export async function interpretPostDayuh(post) {
    const dayuh = post?.dayuh;
    if (!dayuh?.sections) return;

    window.sectionDayuh =[];
    chunkMap.clear();
    
    const rawSections = Array.isArray(dayuh.sections) ? dayuh.sections : Object.values(dayuh.sections);
    allSectionData = rawSections.map((s, i) => ({ data: s, index: i }));
    
    allSectionData.forEach(item => {
        window.sectionDayuh[item.index] = UniversalInterpreter.extractPureText(item.data);
    });

    const realPost = document.getElementById("realPost");
    if(!realPost) return;

    // 1. Scaffolding
    ScribeScaffold.construct(realPost, allSectionData.length);

    // 2. Initial Manifestation
    const s = new URLSearchParams(location.search);
    const startIdx = parseInt(s.get("idx")) || 0;
    const targetChunkId = ScribeScaffold.findChunkByItemIndex(startIdx);
    
    await renderChunk(targetChunkId);
    await renderChunk(targetChunkId + 1);
    if (targetChunkId > 0) await renderChunk(targetChunkId - 1);
}

/**
 * @function renderChunk
 * @description 
 * Recreates a block of Chapter Chapters from nothing.
 * TRIGGER: After the DOM elements exist, we paint the Marginalia safely with a debounce.
 */
export async function renderChunk(chunkId) {
    if (chunkId < 0 || chunkMap.has(chunkId)) return;
    
    const container = document.querySelector(`.scroll-chunk[data-chunk-id="${chunkId}"]`);
    if (!container) return;

    chunkMap.set(chunkId, true);
    
    const start = chunkId * ScribeScaffold.CHUNK_SIZE;
    const end = Math.min(start + ScribeScaffold.CHUNK_SIZE, allSectionData.length);
    const chunkItems = allSectionData.slice(start, end);

    const frag = document.createDocumentFragment();
    for (const item of chunkItems) {
        const dom = await VesselArchitect.manifestSection(item);
        frag.appendChild(dom);
        
        if (window.registerObservable) {
            window.registerObservable(dom);
        }
    }
    
    container.style.minHeight = ""; 
    container.appendChild(frag);
    
    // B"H - PERSISTENT MARGINALIA TRIGGER (DEBOUNCED)
    // Ensures inline comments load flawlessly into the newly forged DOM verses.
    // By re-running the manifestAllActiveInlines ritual, the SparkFixer will 
    // find these newly rendered Verses and attach the appropriate Light to them.
    if (window.pendingInlineManifest) clearTimeout(window.pendingInlineManifest);
    window.pendingInlineManifest = setTimeout(async () => {
        const { manifestAllActiveInlines } = await import("../comments/inline.js");
        await manifestAllActiveInlines();
    }, 300);

    if (window.chai) window.chai.updateParagraphs(); 
    const { initializeFootnotes } = await import("./postFunctions.js");
    initializeFootnotes();
}

export async function generateSection({ data, sectionId }) {
    const sectionData = data || (allSectionData[sectionId]?.data);
    return await VesselArchitect.manifestSection({ data: sectionData, index: sectionId });
}
