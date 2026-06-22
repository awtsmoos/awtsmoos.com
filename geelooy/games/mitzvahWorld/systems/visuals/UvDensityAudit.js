// B"H
/**
 * @file UvDensityAudit.js
 * @description
 * Runtime proof against stretched, smeared textures. The Awtsmoos asks every
 * generated mesh: do your UVs exist, and are they sane enough to avoid one
 * pixel becoming a whole roof, head, or field?
 */
function attr(geo, key) { return geo?.attributes?.[key] || null; }
function span(values) { let min = Infinity, max = -Infinity; for (const v of values) { if (Number.isFinite(v)) { min = Math.min(min, v); max = Math.max(max, v); } } return Number.isFinite(min) ? max - min : 0; }
function uvSpan(uv) { if (!uv?.array) return 0; const u = [], v = []; for (let i = 0; i < uv.array.length; i += 2) { u.push(uv.array[i]); v.push(uv.array[i + 1]); } return Math.max(span(u), span(v)); }
function classify(object, uv) { if (!uv) return "missing-uv"; const s = uvSpan(uv); if (s < .05) return "collapsed-uv"; if (s > 128) return "overscaled-uv"; return "ok"; }
export function auditUvDensity(scene) { const report = { scanned:0, meshes:0, ok:0, issues:[], examples:[] }; scene?.traverse?.(object => { report.scanned++; if (!object?.isMesh && !object?.isSkinnedMesh) return; report.meshes++; const status = classify(object, attr(object.geometry, "uv")); if (status === "ok") report.ok++; else report.issues.push({ name:object.name || object.type, status }); if (report.examples.length < 20) report.examples.push({ name:object.name || object.type, status }); }); globalThis.__AWTSMOOS_UV_DENSITY_AUDIT__ = report; return report; }
export default auditUvDensity;
