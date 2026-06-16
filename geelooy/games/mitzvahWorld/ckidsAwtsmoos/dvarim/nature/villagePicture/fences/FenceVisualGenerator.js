// B"H
/** @file FenceVisualGenerator.js @description Visual-only fence descriptors built from parcel segments. */
import { fenceStyle } from "./FenceStyleCatalog.js";
export function fenceVisualDescriptor(segment = {}) { const style = fenceStyle(segment.style); return { id: `${segment.id}_visual`, segmentId: segment.id, start: segment.start, end: segment.end, style, gap: segment.gap || null, visualOnly: true }; }
export function fenceVisuals(segments = []) { return segments.map(fenceVisualDescriptor); }
export default { fenceVisualDescriptor, fenceVisuals };
