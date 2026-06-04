// B"H
/**
 * @module SovereignScribe
 * @description
 * Chapter 239: The scroll is no longer a ladder made of ghosts.
 * No sleeping verse placeholder remains in the DOM. The container contains only
 * the active verse neighborhood, ordered by verse index. When the reader nears
 * the top or bottom, the oracle streams a neighbor and prunes distant verses.
 */

import { UniversalInterpreter } from "./scribe/UniversalInterpreter.js";
import { ScribeScaffold } from "./scribe/Scaffold.js";
import { VesselArchitect } from "./scribe/Architect.js";
import { forgetSubsectionWindowsInside } from "./scribe/SubsectionVirtualizer.js";
import {
    awakenVirtualScrollOracle,
    restoreScrollTarget,
    resetVirtualScrollOracle
} from "./scribe/VirtualScrollOracle.js";

let allSectionData = [];
let chunkMap = new Map();
let streamContainer = null;

function targetChunkFromLocation() {
    const params = new URLSearchParams(location.search);
    const startIdx = Number.parseInt(params.get("idx") || "0", 10);
    return Number.isFinite(startIdx) && startIdx >= 0 ? startIdx : 0;
}

function removeChunkInlineResidue(container) {
    container.querySelectorAll(".awtsmoos-inline-shell, .marginal-gloss-shelter, .inline-comment").forEach(node => node.remove());
}

function makeChunkShell(chunkId) {
    const chunk = document.createElement("div");
    chunk.className = "scroll-chunk";
    chunk.dataset.chunkId = String(chunkId);
    chunk.dataset.awtsmoosVirtualChunk = "awake";
    chunk.dataset.awtsmoosTrueHeight = "true";
    chunk.style.minHeight = "";
    return chunk;
}

function insertChunkOrdered(chunk) {
    if (!streamContainer) return;
    const id = Number.parseInt(chunk.dataset.chunkId || "0", 10);
    const later = [...streamContainer.querySelectorAll(".scroll-chunk[data-chunk-id]")]
        .find(node => Number.parseInt(node.dataset.chunkId || "0", 10) > id);
    if (later) streamContainer.insertBefore(chunk, later);
    else streamContainer.appendChild(chunk);
}

async function refreshInlineLight() {
    clearTimeout(window.pendingInlineManifest);
    window.pendingInlineManifest = setTimeout(async () => {
        const { manifestAllActiveInlines } = await import("../comments/inline.js");
        await manifestAllActiveInlines();
    }, 120);
}

function installStats() {
    window.__awtsmoosVirtualDomStats = () => ({
        mode: "true-height-verse-and-subsection-stream",
        renderedChunks: [...chunkMap.keys()].sort((a, b) => a - b),
        realSections: document.querySelectorAll("#realPost .section").length,
        awakeSubsections: document.querySelectorAll("#realPost .sub-awtsmoos[data-awtsmoos-substate='awake']").length,
        subsectionWindows: window.__awtsmoosSubsectionVirtualStats?.() || [],
        chunks: [...document.querySelectorAll("#virtual-scroll-container > .scroll-chunk")].map(chunk => ({
            id: Number.parseInt(chunk.dataset.chunkId || "0", 10),
            sections: chunk.querySelectorAll(".section").length,
            awakeSubsections: chunk.querySelectorAll(".sub-awtsmoos[data-awtsmoos-substate='awake']").length,
            height: Math.round(chunk.getBoundingClientRect().height),
            minHeight: chunk.style.minHeight || "none"
        })),
        documentHeight: document.documentElement.scrollHeight,
        viewport: window.innerHeight
    });
}

export async function interpretPostDayuh(post) {
    const dayuh = post?.dayuh;
    if (!dayuh?.sections) return;

    window.sectionDayuh = [];
    window.__awtsmoosVirtualSections = [];
    chunkMap.clear();
    resetVirtualScrollOracle();
    installStats();

    const rawSections = Array.isArray(dayuh.sections) ? dayuh.sections : Object.values(dayuh.sections);
    allSectionData = rawSections.map((section, index) => ({ data: section, index }));
    window.__awtsmoosVirtualSections = allSectionData;
    allSectionData.forEach(item => { window.sectionDayuh[item.index] = UniversalInterpreter.extractPureText(item.data); });

    const realPost = document.getElementById("realPost");
    if (!realPost) return;
    streamContainer = ScribeScaffold.construct(realPost, allSectionData.length, { post, series: window.series });

    const totalChunks = allSectionData.length;
    const targetChunkId = targetChunkFromLocation();
    await renderChunk(targetChunkId);
    awakenVirtualScrollOracle({ totalChunks, renderChunk, unrenderChunk, currentChunk: targetChunkId });
    await restoreScrollTarget(location.search, renderChunk, ScribeScaffold.CHUNK_SIZE);
}

export async function renderChunk(chunkId) {
    if (!Number.isInteger(chunkId) || chunkId < 0 || chunkId >= allSectionData.length) return null;
    if (chunkMap.has(chunkId)) return chunkMap.get(chunkId);
    if (!streamContainer) streamContainer = document.getElementById("virtual-scroll-container");
    if (!streamContainer) return null;

    const container = makeChunkShell(chunkId);
    chunkMap.set(chunkId, container);
    insertChunkOrdered(container);

    const item = allSectionData[chunkId];
    const dom = await VesselArchitect.manifestSection(item);
    container.replaceChildren(dom);
    if (window.registerObservable) window.registerObservable(dom);

    await refreshInlineLight();
    if (window.chai) window.chai.updateParagraphs();
    const { initializeFootnotes } = await import("./postFunctions.js");
    initializeFootnotes();
    return container;
}

export function unrenderChunk(chunkId) {
    const container = chunkMap.get(chunkId);
    if (!container) return false;
    forgetSubsectionWindowsInside(container);
    removeChunkInlineResidue(container);
    container.remove();
    chunkMap.delete(chunkId);
    return true;
}

export async function generateSection({ data, sectionId }) {
    const sectionData = data || allSectionData[sectionId]?.data;
    return VesselArchitect.manifestSection({ data: sectionData, index: sectionId });
}
