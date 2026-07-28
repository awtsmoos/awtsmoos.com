// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SovereignScribe
 * @description
 * Every verse and punctuation vessel enters the DOM during the first reading
 * pass. The Awtsmoos brings footnotes through their direct module, never by
 * circling through an aggregator that re-exports this scribe itself.
 */

import { initializeFootnotes } from "../functions/interaction/footnotes.js";
import { VesselArchitect } from "./scribe/Architect.js";
import { appendOnce, insertChunkOrdered, makeChunkShell, scrollToRequestedChunk } from "./scribe/ReaderChunkDom.js";
import { installReaderDomStats } from "./scribe/ReaderDomStats.js";
import { ScribeScaffold } from "./scribe/Scaffold.js";
import { UniversalInterpreter } from "./scribe/UniversalInterpreter.js";
import { resetVirtualScrollOracle } from "./scribe/VirtualScrollOracle.js";

let allSectionData = [];
let chunkMap = new Map();
let streamContainer = null;

async function manifestInlineOnce(label) {
	const { manifestAllActiveInlines } = await import("../comments/inline.js");
	const result = await manifestAllActiveInlines();
	window.__awtsmoosInlineAfterAllDom = { label, at: Date.now(), result };
	return result;
}

async function refreshInlineLight() {
	clearTimeout(window.pendingInlineManifest);
	const result = await manifestInlineOnce("after-all-verses");
	window.pendingInlineManifest = setTimeout(() => {
		manifestInlineOnce("settled-repair").catch(error => {
			if (window.__awtsmoosInlineDebug) console.warn("B\"H settled inline repair resisted", error);
		});
	}, 350);
	return result;
}

function resetPageSession() {
	window.sectionDayuh = [];
	window.__awtsmoosVirtualSections = [];
	chunkMap.clear();
	resetVirtualScrollOracle();
	installReaderDomStats(chunkMap);
}

function normalizeSections(dayuh) {
	const rawSections = Array.isArray(dayuh?.sections)
		? dayuh.sections
		: Object.values(dayuh?.sections || {});
	allSectionData = rawSections.map((section, index) => ({ data: section, index }));
	window.__awtsmoosVirtualSections = allSectionData;
	for (const item of allSectionData) {
		window.sectionDayuh[item.index] = UniversalInterpreter.extractPureText(item.data);
	}
}

/** Manifests every structured section and its punctuation vessels. */
export async function interpretPostDayuh(post) {
	if (!post?.dayuh?.sections) return;
	resetPageSession();
	normalizeSections(post.dayuh);
	const realPost = document.getElementById("realPost");
	if (!realPost) return;
	streamContainer = ScribeScaffold.construct(realPost, allSectionData.length, { post, series: window.series });
	streamContainer.dataset.virtualMode = "disabled-all-verses-present";
	for (const item of allSectionData) await renderChunk(item.index);
	await refreshInlineLight();
	scrollToRequestedChunk();
}

/** Manifests one verse chunk without circular module imports. */
export async function renderChunk(chunkId) {
	if (!Number.isInteger(chunkId) || chunkId < 0 || chunkId >= allSectionData.length) return null;
	if (chunkMap.has(chunkId)) return chunkMap.get(chunkId);
	streamContainer ||= document.getElementById("virtual-scroll-container");
	if (!streamContainer) return null;
	const container = makeChunkShell(chunkId);
	chunkMap.set(chunkId, container);
	insertChunkOrdered(streamContainer, container);
	const sectionDom = await VesselArchitect.manifestSection(allSectionData[chunkId]);
	appendOnce(container, sectionDom);
	if (window.registerObservable) window.registerObservable(sectionDom);
	if (window.chai) window.chai.updateParagraphs();
	initializeFootnotes();
	return container;
}

/** Generates a single section for older callers. */
export async function generateSection({ data, sectionId }) {
	return VesselArchitect.manifestSection({
		data: data || allSectionData[sectionId]?.data,
		index: sectionId
	});
}
