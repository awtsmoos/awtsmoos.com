// B"H
/**
 * @file AnimalSoftAudit.js
 * @description Animal render audits record failures without per-animal warning
 * spam. Wildlife remains visible; diagnostics are aggregated for inspection.
 */
import { assertAnimalRenderable } from "../skinned/AnimalRenderableAudit.js?v=single-mesh-animals-20260621-bh1";
const KEY = "__MITZVAH_ANIMAL_RENDERABLE_AUDIT__";
function store() { const root = globalThis; root[KEY] ||= { softened:0, byMessage:{}, samples:[], lastWarnAt:0 }; return root[KEY]; }
export function countMeshes(root) { let count = 0; root?.traverse?.(child => { if (child?.isMesh || child?.isSkinnedMesh) count += 1; }); return count; }
function record(mesh, error) { const message = error?.message || String(error), state = store(); state.softened += 1; state.byMessage[message] = (state.byMessage[message] || 0) + 1; state.samples.push({ name:mesh?.name, message, at:Date.now() }); state.samples = state.samples.slice(-12); if (globalThis.__AWTSMOOS_ANIMAL_AUDIT_WARN__ === true && Date.now() - state.lastWarnAt > 5000) { state.lastWarnAt = Date.now(); console.warn('B"H animal renderable audit summary', { softened:state.softened, messages:Object.keys(state.byMessage).length, last:state.samples.at(-1) }); } }
function warningAudit(mesh, error) { const data = mesh?.userData || {}, geometry = mesh?.geometry || {}, position = geometry.attributes?.position, indexed = geometry.index?.count ? Math.floor(geometry.index.count / 3) : null; record(mesh, error); return { roots:1, skinnedMeshes:mesh?.isSkinnedMesh ? 1 : 0, clips:data.clipCount || 0, missingSkinAttributes:geometry.attributes?.skinIndex && geometry.attributes?.skinWeight ? 0 : 1, backend:data.renderBackend || null, hasSkeleton:Boolean(mesh?.skeleton), isSkinnedMesh:Boolean(mesh?.isSkinnedMesh), mixerTarget:data.animationMixerTarget || "root-fallback", bindingUnsafe:true, warningOnly:true, message:error?.message || String(error), vertexCount:position?.count || 0, triangleCount:indexed ?? Math.floor((position?.count || 0) / 3) }; }
export function softAuditAnimal(mesh) { try { return assertAnimalRenderable(mesh); } catch (error) { return warningAudit(mesh, error); } }
