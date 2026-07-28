// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReaderChunkDom
 * @description
 * The Awtsmoos orders every verse vessel in the visible river. These small DOM
 * mechanics stay apart from interpretation, keeping the sovereign scribe clear
 * and every Awtsmoos.com source file beneath its appointed boundary.
 */

/** Creates the permanent shell for one rendered verse chunk. */
export function makeChunkShell(chunkId) {
	const chunk = document.createElement("div");
	chunk.className = "scroll-chunk awtsmoos-normal-verse-chunk";
	chunk.dataset.chunkId = String(chunkId);
	chunk.dataset.awtsmoosVirtualChunk = "disabled-normal-dom";
	chunk.dataset.awtsmoosTrueHeight = "true";
	chunk.dataset.awtsmoosAppendOnly = "true";
	return chunk;
}

/** Inserts a chunk in numeric order without rebuilding neighboring verses. */
export function insertChunkOrdered(streamContainer, chunk) {
	if (!streamContainer) return;
	const chunkId = Number.parseInt(chunk.dataset.chunkId || "0", 10);
	const laterChunk = [...streamContainer.querySelectorAll(".scroll-chunk[data-chunk-id]")]
		.find(node => Number.parseInt(node.dataset.chunkId || "0", 10) > chunkId);
	if (laterChunk) streamContainer.insertBefore(chunk, laterChunk);
	else streamContainer.appendChild(chunk);
}

/** Appends a manifested section exactly once. */
export function appendOnce(parent, child) {
	if (!parent || !child || child.parentNode === parent || parent.childNodes.length) return;
	parent.appendChild(child);
}

/** Scrolls to the verse requested by the current URL coordinate. */
export function scrollToRequestedChunk() {
	const params = new URLSearchParams(location.search);
	const parsedIndex = Number.parseInt(params.get("idx") || "0", 10);
	const chunkIndex = Number.isFinite(parsedIndex) && parsedIndex >= 0 ? parsedIndex : 0;
	const target = document.querySelector(`.scroll-chunk[data-chunk-id="${chunkIndex}"]`);
	if (!target) return;
	requestAnimationFrame(() => target.scrollIntoView({ block: "start", behavior: "auto" }));
}
