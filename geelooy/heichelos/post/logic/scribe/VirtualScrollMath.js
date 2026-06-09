// B"H
/**
 * @module VirtualScrollMath
 * @description
 * Chapter 262: The math no longer speaks of pruning.
 *
 * These helpers describe additive scroll windows. Legacy callers may still ask
 * which chunks are outside a radius, but the answer is intentionally empty.
 * The Awtsmoos only adds in this reading session; it does not recommend
 * removal.
 */

export function chunkWindow(chunkId, totalChunks, radius = 1) {
    const center = Number.isInteger(chunkId) ? chunkId : 0;
    const total = Number.isInteger(totalChunks) ? totalChunks : 0;
    const span = Math.max(0, Number.isInteger(radius) ? radius : 1);
    const ids = [];
    for (let id = center - span; id <= center + span; id++) {
        if (id >= 0 && id < total) ids.push(id);
    }
    return ids;
}

export function additiveAheadWindow(center, totalChunks, direction = 1, steps = 5) {
    const normalized = direction >= 0 ? 1 : -1;
    const total = Number.isInteger(totalChunks) ? totalChunks : 0;
    const ids = [];
    for (let step = 1; step <= steps; step++) {
        const id = center + step * normalized;
        if (id < 0 || id >= total) break;
        ids.push(id);
    }
    return ids;
}

export function chunksToPrune() {
    return [];
}

export function parseScrollTarget(query) {
    const params = query instanceof URLSearchParams ? query : new URLSearchParams(query || "");
    const idx = Number.parseInt(params.get("idx") || "0", 10);
    const rawSub = params.get("sub");
    const sub = rawSub === null || rawSub === "" ? null : Number.parseInt(rawSub, 10);
    return { idx: Number.isFinite(idx) && idx >= 0 ? idx : 0, sub: Number.isFinite(sub) ? sub : null };
}
