// B"H
/**
 * @module SovereignScribe
 * @description
 * Chapter 3: The living scroll keeps all wisdom in RAM while the DOM breathes.
 * Nearby chunks receive bodies; distant chunks return to placeholder sleep with
 * their height remembered, so refresh, inline sparks, and mobile glass survive.
 */

import { UniversalInterpreter } from "./scribe/UniversalInterpreter.js";
import { ScribeScaffold } from "./scribe/Scaffold.js";
import { VesselArchitect } from "./scribe/Architect.js";
import {
    awakenVirtualScrollOracle,
    restoreScrollTarget,
    resetVirtualScrollOracle
} from "./scribe/VirtualScrollOracle.js";

let allSectionData = [];
let chunkMap = new Map();

function targetChunkFromLocation() {
    const params = new URLSearchParams(location.search);
    const startIdx = Number.parseInt(params.get("idx") || "0", 10);
    const safeIdx = Number.isFinite(startIdx) && startIdx >= 0 ? startIdx : 0;
    return ScribeScaffold.findChunkByItemIndex(safeIdx);
}

async function refreshInlineLight() {
    if (window.pendingInlineManifest) clearTimeout(window.pendingInlineManifest);
    window.pendingInlineManifest = setTimeout(async () => {
        const { manifestAllActiveInlines } = await import("../comments/inline.js");
        await manifestAllActiveInlines();
    }, 220);
}

/**
 * Interprets Dayuh content into a virtualized scroll scaffold.
 * @param {object} post Loaded post object.
 * @returns {Promise<void>}
 */
export async function interpretPostDayuh(post) {
    const dayuh = post?.dayuh;
    if (!dayuh?.sections) return;

    window.sectionDayuh = [];
    chunkMap.clear();
    resetVirtualScrollOracle();

    const rawSections = Array.isArray(dayuh.sections) ? dayuh.sections : Object.values(dayuh.sections);
    allSectionData = rawSections.map((section, index) => ({ data: section, index }));

    allSectionData.forEach(item => {
        window.sectionDayuh[item.index] = UniversalInterpreter.extractPureText(item.data);
    });

    const realPost = document.getElementById("realPost");
    if (!realPost) return;

    ScribeScaffold.construct(realPost, allSectionData.length);
    const totalChunks = Math.ceil(allSectionData.length / ScribeScaffold.CHUNK_SIZE);
    const targetChunkId = targetChunkFromLocation();

    await renderChunk(targetChunkId);
    await renderChunk(targetChunkId + 1);
    if (targetChunkId > 0) await renderChunk(targetChunkId - 1);

    awakenVirtualScrollOracle({ totalChunks, renderChunk, unrenderChunk });
    await restoreScrollTarget(location.search, renderChunk, ScribeScaffold.CHUNK_SIZE);
}

/**
 * Reveals one chunk of sections, once, into its waiting scaffold vessel.
 * @param {number} chunkId Chunk index.
 * @returns {Promise<Element|null>} Rendered chunk container.
 */
export async function renderChunk(chunkId) {
    if (!Number.isInteger(chunkId) || chunkId < 0 || chunkMap.has(chunkId)) return null;

    const container = document.querySelector(`.scroll-chunk[data-chunk-id="${chunkId}"]`);
    if (!container) return null;

    chunkMap.set(chunkId, true);
    const start = chunkId * ScribeScaffold.CHUNK_SIZE;
    const end = Math.min(start + ScribeScaffold.CHUNK_SIZE, allSectionData.length);
    const chunkItems = allSectionData.slice(start, end);
    const frag = document.createDocumentFragment();

    for (const item of chunkItems) {
        const dom = await VesselArchitect.manifestSection(item);
        frag.appendChild(dom);
        if (window.registerObservable) window.registerObservable(dom);
    }

    container.style.minHeight = "";
    container.dataset.awtsmoosRevealed = "true";
    container.appendChild(frag);
    await refreshInlineLight();

    if (window.chai) window.chai.updateParagraphs();
    const { initializeFootnotes } = await import("./postFunctions.js");
    initializeFootnotes();
    return container;
}

/**
 * Returns a distant chunk to placeholder sleep while preserving scroll geometry.
 * @param {number} chunkId Chunk index.
 * @returns {boolean} True when a rendered chunk was cleared.
 */
export function unrenderChunk(chunkId) {
    if (!Number.isInteger(chunkId) || !chunkMap.has(chunkId)) return false;
    const container = document.querySelector(`.scroll-chunk[data-chunk-id="${chunkId}"]`);
    if (!container) return false;
    const rememberedHeight = Math.max(container.offsetHeight || 0, ScribeScaffold.CHUNK_SIZE * 65);
    container.replaceChildren();
    container.style.minHeight = `${rememberedHeight}px`;
    delete container.dataset.awtsmoosRevealed;
    chunkMap.delete(chunkId);
    return true;
}

/**
 * Generates one section outside the virtualized scroll path.
 * @param {{data?: object, sectionId?: number}} options Section options.
 * @returns {Promise<HTMLElement>} Rendered section.
 */
export async function generateSection({ data, sectionId }) {
    const sectionData = data || allSectionData[sectionId]?.data;
    return VesselArchitect.manifestSection({ data: sectionData, index: sectionId });
}
