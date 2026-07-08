// B"H
/** @file RendererProvider.js @description Singleton backend provider; Three is current but not the covenant. */
import { createThreeRenderBackend } from "./backends/three/ThreeRenderBackend.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
let backend = null;
export function setRenderBackend(next) { backend = next; return backend; }
export function getRenderBackend() { if (!backend) backend = createThreeRenderBackend(); return backend; }
export function ensureRenderBackend() { const current = getRenderBackend(); if (!current) throw new Error("B\"H no render backend available"); return current; }
export default { setRenderBackend, getRenderBackend, ensureRenderBackend };
