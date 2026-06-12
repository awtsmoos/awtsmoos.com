// B"H
/**
 * @module SovereignScribe
 * @description
 * Chapter 301: Every verse enters the palace at once.
 *
 * The old river revealed one section and waited for a virtual oracle to invite
 * more. For this repair pass the user asked for no virtualization. The Scribe
 * now manifests all sections during initial load. Each verse still receives its
 * own chunk shell for coordinate compatibility, but no chunk is withheld.
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
    chunk.className = 'scroll-chunk';
    chunk.dataset.chunkId = String(chunkId);
    chunk.dataset.awtsmoosVirtualChunk = 'eager';
    chunk.dataset.awtsmoosTrueHeight = 'true';
    chunk.dataset.awtsmoosAppendOnly = 'true';
    chunk.style.minHeight = '';
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
    if (!parent || !child || child.parentNode === parent) return;
    if (parent.childNodes.length > 0) return;
    parent.appendChild(child);
}

async function refreshInlineLight() {
    clearTimeout(window.pendingInlineManifest);
    window.pendingInlineManifest = setTimeout(async () => {
        const { manifestAllActiveInlines } = await import('../comments/inline.js');
        await manifestAllActiveInlines();
    }, 120);
}

function installStats() {
    window.__awtsmoosVirtualDomStats = () => ({
        mode: 'eager-all-verse-dom',
        renderedChunks: [...chunkMap.keys()].sort((a, b) => a - b),
        realSections: document.querySelectorAll('#realPost .section').length,
        awakeSubsections: document.querySelectorAll("#realPost .sub-awtsmoos[data-awtsmoos-substate='awake']").length,
        subsectionWindows: window.__awtsmoosSubsectionVirtualStats?.() || [],
        chunks: [...document.querySelectorAll('#virtual-scroll-container > .scroll-chunk')].map(chunk => ({
            id: Number.parseInt(chunk.dataset.chunkId || '0', 10),
            appendOnly: chunk.dataset.awtsmoosAppendOnly === 'true',
            sections: chunk.querySelectorAll('.section').length,
            awakeSubsections: chunk.querySelectorAll(".sub-awtsmoos[data-awtsmoos-substate='awake']").length,
            height: Math.round(chunk.getBoundingClientRect().height),
            minHeight: chunk.style.minHeight || 'none'
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
    const source = dayuh?.sections;
    const rawSections = Array.isArray(source) ? source : Object.values(source || {});
    allSectionData = rawSections.map((section, index) => ({ data: section, index }));
    window.__awtsmoosVirtualSections = allSectionData;
    allSectionData.forEach(item => {
        window.sectionDayuh[item.index] = UniversalInterpreter.extractPureText(item.data);
    });
}

function scrollToRequestedChunk() {
    const target = document.querySelector(`.scroll-chunk[data-chunk-id="${targetChunkFromLocation()}"]`);
    if (!target) return;
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'auto' }));
}

export async function interpretPostDayuh(post) {
    const dayuh = post?.dayuh;
    if (!dayuh?.sections) return;

    resetPageSession();
    normalizeSections(dayuh);

    const realPost = document.getElementById('realPost');
    if (!realPost) return;
    streamContainer = ScribeScaffold.construct(realPost, allSectionData.length, { post, series: window.series });
    streamContainer.dataset.virtualMode = 'eager-all-verses';

    for (const item of allSectionData) {
        await renderChunk(item.index);
    }

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

    const item = allSectionData[chunkId];
    const dom = await VesselArchitect.manifestSection(item);
    appendOnce(container, dom);
    if (window.registerObservable) window.registerObservable(dom);

    if (window.chai) window.chai.updateParagraphs();
    const { initializeFootnotes } = await import('./postFunctions.js');
    initializeFootnotes();
    return container;
}

export async function generateSection({ data, sectionId }) {
    const sectionData = data || allSectionData[sectionId]?.data;
    return VesselArchitect.manifestSection({ data: sectionData, index: sectionId });
}
