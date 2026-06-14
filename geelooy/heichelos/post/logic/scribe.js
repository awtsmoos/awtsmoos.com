// B"H
/**
 * @module SovereignScribe
 * @description
 * Chapter 310: No virtual river remains.
 * Every verse and subsection enters the DOM during the first reading pass. The
 * legacy chunk names remain only as coordinates for older modules; they no
 * longer mean withheld content, synthetic scroll, or virtual loading.
 */

import { UniversalInterpreter } from './scribe/UniversalInterpreter.js';
import { ScribeScaffold } from './scribe/Scaffold.js';
import { VesselArchitect } from './scribe/Architect.js';
import { resetVirtualScrollOracle } from './scribe/VirtualScrollOracle.js';

let allSectionData = [];
let chunkMap = new Map();
let streamContainer = null;

function targetChunkFromLocation() {
    const params = new URLSearchParams(location.search);
    const startIdx = Number.parseInt(params.get('idx') || '0', 10);
    return Number.isFinite(startIdx) && startIdx >= 0 ? startIdx : 0;
}

function makeChunkShell(chunkId) {
    const chunk = document.createElement('div');
    chunk.className = 'scroll-chunk awtsmoos-normal-verse-chunk';
    chunk.dataset.chunkId = String(chunkId);
    chunk.dataset.awtsmoosVirtualChunk = 'disabled-normal-dom';
    chunk.dataset.awtsmoosTrueHeight = 'true';
    chunk.dataset.awtsmoosAppendOnly = 'true';
    return chunk;
}

function insertChunkOrdered(chunk) {
    if (!streamContainer) return;
    const id = Number.parseInt(chunk.dataset.chunkId || '0', 10);
    const later = [...streamContainer.querySelectorAll('.scroll-chunk[data-chunk-id]')]
        .find(node => Number.parseInt(node.dataset.chunkId || '0', 10) > id);
    if (later) streamContainer.insertBefore(chunk, later);
    else streamContainer.appendChild(chunk);
}

function appendOnce(parent, child) {
    if (!parent || !child || child.parentNode === parent || parent.childNodes.length) return;
    parent.appendChild(child);
}

async function manifestInlineOnce(label = 'initial') {
    const { manifestAllActiveInlines } = await import('../comments/inline.js');
    const result = await manifestAllActiveInlines();
    window.__awtsmoosInlineAfterAllDom = { label, at: Date.now(), result };
    return result;
}

async function refreshInlineLight() {
    clearTimeout(window.pendingInlineManifest);
    const result = await manifestInlineOnce('after-all-verses');
    window.pendingInlineManifest = setTimeout(() => manifestInlineOnce('settled-repair').catch(error => {
        if (window.__awtsmoosInlineDebug) console.warn('B"H settled inline repair resisted', error);
    }), 350);
    return result;
}

function installStats() {
    window.__awtsmoosVirtualDomStats = () => ({
        mode: 'native-normal-dom-all-verses',
        renderedChunks: [...chunkMap.keys()].sort((a, b) => a - b),
        realSections: document.querySelectorAll('#realPost .section').length,
        awakeSubsections: document.querySelectorAll("#realPost .sub-awtsmoos[data-awtsmoos-substate='awake']").length,
        subsectionWindows: window.__awtsmoosSubsectionVirtualStats?.() || [],
        chunks: [...document.querySelectorAll('#virtual-scroll-container > .scroll-chunk')].map(chunk => ({
            id: Number.parseInt(chunk.dataset.chunkId || '0', 10),
            appendOnly: chunk.dataset.awtsmoosAppendOnly === 'true',
            sections: chunk.querySelectorAll('.section').length,
            awakeSubsections: chunk.querySelectorAll(".sub-awtsmoos[data-awtsmoos-substate='awake']").length,
            height: Math.round(chunk.getBoundingClientRect().height)
        })),
        documentHeight: document.documentElement.scrollHeight,
        viewport: window.innerHeight
    });
}

function resetPageSession() {
    window.sectionDayuh = [];
    window.__awtsmoosVirtualSections = [];
    chunkMap.clear();
    resetVirtualScrollOracle();
    installStats();
}

function normalizeSections(dayuh) {
    const raw = Array.isArray(dayuh?.sections) ? dayuh.sections : Object.values(dayuh?.sections || {});
    allSectionData = raw.map((section, index) => ({ data: section, index }));
    window.__awtsmoosVirtualSections = allSectionData;
    allSectionData.forEach(item => { window.sectionDayuh[item.index] = UniversalInterpreter.extractPureText(item.data); });
}

function scrollToRequestedChunk() {
    const target = document.querySelector(`.scroll-chunk[data-chunk-id="${targetChunkFromLocation()}"]`);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'auto' }));
}

export async function interpretPostDayuh(post) {
    const dayuh = post?.dayuh;
    if (!dayuh?.sections) return;
    resetPageSession();
    normalizeSections(dayuh);
    const realPost = document.getElementById('realPost');
    if (!realPost) return;
    streamContainer = ScribeScaffold.construct(realPost, allSectionData.length, { post, series: window.series });
    streamContainer.dataset.virtualMode = 'disabled-all-verses-present';
    for (const item of allSectionData) await renderChunk(item.index);
    await refreshInlineLight();
    scrollToRequestedChunk();
}

export async function renderChunk(chunkId) {
    if (!Number.isInteger(chunkId) || chunkId < 0 || chunkId >= allSectionData.length) return null;
    if (chunkMap.has(chunkId)) return chunkMap.get(chunkId);
    if (!streamContainer) streamContainer = document.getElementById('virtual-scroll-container');
    if (!streamContainer) return null;
    const container = makeChunkShell(chunkId);
    chunkMap.set(chunkId, container);
    insertChunkOrdered(container);
    const dom = await VesselArchitect.manifestSection(allSectionData[chunkId]);
    appendOnce(container, dom);
    if (window.registerObservable) window.registerObservable(dom);
    if (window.chai) window.chai.updateParagraphs();
    const { initializeFootnotes } = await import('./postFunctions.js');
    initializeFootnotes();
    return container;
}

export async function generateSection({ data, sectionId }) {
    return VesselArchitect.manifestSection({ data: data || allSectionData[sectionId]?.data, index: sectionId });
}
