//B"H
/**
 * @file scribe.js
 * @description 
 * B"H - THE VIRTUAL SCRIBE.
 * This module is the Sefirah of Yesod (The Foundation), funneling the infinite 'Dayuh' 
 * (Knowledge) into physical 'Otiyot' (DOM Elements). It uses chunk-based rendering 
 * to ensure that even the longest scrolls are manifest instantly without shattering 
 * the user's perception (lag).
 */

import { sanitizeContent, appendHTML, isFirstCharacterHebrew, updateQueryStringParameter } from "../postFunctions.js";
import { weaveDropdownFromAwtsmoos, initializeFootnotes } from "../postFunctions.js";

let allSectionData = [];
let chunkMap = new Map();
const CHUNK_SIZE = 12; // Small, agile chunks for rapid manifestion

/**
 * interpretPostDayuh
 * @description B"H - The primary ritual of the Scribe. Takes the raw post data 
 * and establishes the 'Virtual Scroll Container'—the scaffolding of Atzilus.
 * @param {Object} post - The post object containing the dayuh.
 */
export async function interpretPostDayuh(post) {
    const dayuh = post?.dayuh;
    if (!dayuh?.sections) return;

    window.sectionDayuh = [];
    
    // Normalize sections into a processable array
    const rawSections = Array.isArray(dayuh.sections) ? dayuh.sections : Object.values(dayuh.sections);
    allSectionData = rawSections.map((s, i) => ({ data: s, index: i }));
    
    // Cache the pure text for deep-logic access
    allSectionData.forEach(item => {
        window.sectionDayuh[item.index] = extractTextFromData(item.data);
    });

    const realPost = document.getElementById("realPost");
    if(!realPost) return;
    realPost.innerHTML = "";

    // 1. FORGE THE VIRTUAL SCAFFOLDING
    const scrollContainer = document.createElement("div");
    scrollContainer.id = "virtual-scroll-container";
    realPost.appendChild(scrollContainer);

    const totalChunks = Math.ceil(allSectionData.length / CHUNK_SIZE);
    console.log(`B"H - [Scribe] Manifesting ${allSectionData.length} sections in ${totalChunks} chunks.`);

    for (let c = 0; c < totalChunks; c++) {
        const chunk = document.createElement("div");
        chunk.className = "scroll-chunk";
        chunk.dataset.chunkId = c;
        // Placeholder height to maintain scrollbar integrity
        chunk.style.minHeight = `${CHUNK_SIZE * 60}px`; 
        chunk.style.contain = "content"; 
        scrollContainer.appendChild(chunk);
    }

    // 2. SYSTEMS IGNITION
    // B"H - We MUST ensure ViewEffects (and the Observer) are ready before rendering first chunk
    const { setupViewEffects } = await import("./viewEffects.js");
    setupViewEffects();

    // 3. INITIAL LANDING
    const s = new URLSearchParams(location.search);
    const startIdx = parseInt(s.get("idx"));
    
    if (!isNaN(startIdx)) {
        const targetChunkId = Math.floor(startIdx / CHUNK_SIZE);
        console.log(`B"H - [Scribe] Landing coordinates: Chunk ${targetChunkId}`);
        await renderChunk(targetChunkId, document.querySelector(`.scroll-chunk[data-chunk-id="${targetChunkId}"]`));
        // Manifest immediate neighbors for smoothness
        for(let i=-1; i<=1; i++) {
            const neighbor = targetChunkId + i;
            if(neighbor >= 0 && neighbor < totalChunks) {
                renderChunk(neighbor, document.querySelector(`.scroll-chunk[data-chunk-id="${neighbor}"]`));
            }
        }
    } else {
        // Start from the beginning of the scroll
        await renderChunk(0, document.querySelector('.scroll-chunk[data-chunk-id="0"]'));
    }
}

/**
 * renderChunk
 * @description B"H - Transforms the potential data into physical nodes within a specific chunk.
 */
async function renderChunk(chunkId, container) {
    if (!container || chunkMap.has(chunkId)) return;
    chunkMap.set(chunkId, true);
    
    const startIndex = chunkId * CHUNK_SIZE;
    const endIndex = Math.min(startIndex + CHUNK_SIZE, allSectionData.length);
    const chunkItems = allSectionData.slice(startIndex, endIndex);

    const frag = document.createDocumentFragment();
    for (const item of chunkItems) {
        const dom = await createSectionDOM(item.data, item.index);
        if (dom) {
            frag.appendChild(dom);
            
            // B"H - REGISTRATION WITH THE WATCHMAN
            // We tell the Observer that a new vessel is manifest.
            if (window.registerObservable) {
                window.registerObservable(dom);
            }
        }
    }
    
    container.style.minHeight = ""; 
    container.appendChild(frag);
    
    // Update any external highlight engines
    if (window.chai) window.chai.updateParagraphs(); 
    
    const { initializeFootnotes: initFN } = await import("../postFunctions.js");
    initFN();
}

/**
 * createSectionDOM
 * @description B"H - Forges the individual Verse-vessel.
 */
async function createSectionDOM(data, index) {
    const vs = data.verseSection;
    let dynamicContent = data.subSections || data.paragraphs || (Array.isArray(data) ? data : null);
    let flatText = (typeof data === 'string') ? data : data.text;

    const sectionEl = document.createElement("div");
    sectionEl.className = "section";
    sectionEl.dataset.idx = index;
    sectionEl.dataset.awtsmoosIdx = index;

    const hdr = document.createElement("div");
    hdr.className = "awtsmoos-section-header";
    
    const num = document.createElement("div");
    num.className = "awtsmoos-verse-number";
    num.textContent = (vs !== undefined && vs !== null) ? vs : (index + 1);
    
    // Bind dropdown interaction to the verse number
    num.addEventListener('click', async (e) => {
        e.stopPropagation();
        const { atzilusActions } = await import("./conductor.js"); 
        weaveDropdownFromAwtsmoos(hdr, atzilusActions || {});
    });

    hdr.appendChild(num);
    sectionEl.appendChild(hdr);

    const body = document.createElement("div");
    body.className = "toichen";
    sectionEl.appendChild(body);

    if (flatText) appendHTML(sanitizeContent(flatText), body);

    if (dynamicContent) {
        const subWrap = document.createElement("div");
        subWrap.className = "awtsmoos-subsection-wrap";
        const list = Array.isArray(dynamicContent) ? dynamicContent : [];
        
        list.forEach((subItem, sIdx) => {
            const txt = typeof subItem === 'string' ? subItem : subItem.text;
            if (!txt) return;
            
            const subEl = document.createElement("div");
            subEl.className = "sub-awtsmoos " + (isFirstCharacterHebrew(txt) ? "heb" : "en");
            subEl.dataset.awtsmoosSub = sIdx;
            subEl.dataset.awtsmoosIdx = index;
            subEl.dataset.idx = sIdx;
            
            appendHTML(sanitizeContent(txt), subEl);
            subWrap.appendChild(subEl);
        });
        body.appendChild(subWrap);
    }
    
    if (isFirstCharacterHebrew(body.innerText)) sectionEl.classList.add("heb");
    else sectionEl.classList.add("en");

    return sectionEl;
}

function extractTextFromData(d) {
    if (typeof d === 'string') return d;
    if (d.text) return d.text;
    if (Array.isArray(d)) return d.map(extractTextFromData).join(" ");
    if (d.paragraphs) return d.paragraphs.map(extractTextFromData).join(" ");
    if (d.subSections) return d.subSections.map(extractTextFromData).join(" ");
    return "";
}