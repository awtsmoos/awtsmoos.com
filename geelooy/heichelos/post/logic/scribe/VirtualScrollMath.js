// B"H
/**
 * @module VirtualScrollMath
 * @description
 * Chapter 233: The verse gates remember their neighbors.
 * One chunk is one verse. The current gate and one gate above/below remain
 * ready, while all farther gates go back to placeholder height.
 */

export function chunkWindow(chunkId, totalChunks) {
    return [chunkId - 1, chunkId, chunkId + 1].filter(id => Number.isInteger(id) && id >= 0 && id < totalChunks);
}

export function chunksToPrune(rendered, center, radius = 1) {
    return [...rendered].filter(id => Number.isInteger(id) && Math.abs(id - center) > radius);
}

export function parseScrollTarget(query) {
    const params = query instanceof URLSearchParams ? query : new URLSearchParams(query || "");
    const idx = Number.parseInt(params.get("idx") || "0", 10);
    const rawSub = params.get("sub");
    const sub = rawSub === null || rawSub === "" ? null : Number.parseInt(rawSub, 10);
    return { idx: Number.isFinite(idx) && idx >= 0 ? idx : 0, sub: Number.isFinite(sub) ? sub : null };
}
