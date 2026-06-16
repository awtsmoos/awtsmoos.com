// B"H
/** @file ColliderRealityAudit.js @description Audits invisible walls, visible twins, door gaps, and source categories. */
import { collectColliderSources, summarizeColliderSources } from "./ColliderSourceManifest.js";
export function auditColliderReality(root) { const records = collectColliderSources(root), summary = summarizeColliderSources(records); const issues = []; for (const r of records) { if (!r.category || r.category === "unknown") issues.push({ id:r.id, issue:"unlabeled-collider" }); if (r.visualOnly && !r.allowedInvisible) issues.push({ id:r.id, issue:"visual-only-in-solid-manifest" }); if (r.door && r.open) issues.push({ id:r.id, issue:"open-door-still-solid" }); if (!r.visibleTwin && !r.allowedInvisible) issues.push({ id:r.id, issue:"missing-visible-twin" }); } return { ok:issues.length === 0, summary, issues }; }
export function attachColliderRealityAudit(root) { const audit = auditColliderReality(root); root.userData ||= {}; root.userData.colliderRealityAudit = audit; return audit; }
export default auditColliderReality;
