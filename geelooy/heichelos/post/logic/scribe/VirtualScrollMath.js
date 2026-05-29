// B"H
/**
 * @module VirtualScrollMath
 * @description
 * Chapter 4: Before the scroll moves, the numbers bow. These pure helpers keep
 * the oracle small: which chunks surround the reader, which chunks may sleep,
 * and where a refreshed URL points inside the living text.
 */

/**
 * Computes the local world around a chunk so reading never hits an empty void.
 * @param {number} chunkId Chunk entering the viewport.
 * @param {number} totalChunks Total chunks in the scroll.
 * @returns {number[]} Previous/current/next chunk ids inside bounds.
 */
export function chunkWindow(chunkId, totalChunks) {
    return [chunkId - 1, chunkId, chunkId + 1]
        .filter(id => Number.isInteger(id) && id >= 0 && id < totalChunks);
}

/**
 * Selects already-rendered chunks far enough away to sleep again.
 * @param {Iterable<number>} rendered Rendered chunk ids.
 * @param {number} center Current chunk id.
 * @param {number} radius Keep radius around the center.
 * @returns {number[]} Chunk ids to unrender.
 */
export function chunksToPrune(rendered, center, radius = 3) {
    return [...rendered].filter(id => Number.isInteger(id) && Math.abs(id - center) > radius);
}

/**
 * Converts a URL query into stable section/subsection coordinates.
 * @param {string|URLSearchParams} query Search string or URLSearchParams.
 * @returns {{idx:number, sub:number|null}}
 */
export function parseScrollTarget(query) {
    const params = query instanceof URLSearchParams ? query : new URLSearchParams(query || "");
    const idx = Number.parseInt(params.get("idx") || "0", 10);
    const rawSub = params.get("sub");
    const sub = rawSub === null || rawSub === "" ? null : Number.parseInt(rawSub, 10);
    return { idx: Number.isFinite(idx) && idx >= 0 ? idx : 0, sub: Number.isFinite(sub) ? sub : null };
}
