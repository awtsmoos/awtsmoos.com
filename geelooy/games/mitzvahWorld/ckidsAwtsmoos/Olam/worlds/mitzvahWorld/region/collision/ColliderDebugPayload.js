// B"H
/** @file ColliderDebugPayload.js @description Small UI/debug payload for last wall hits and collider source records. */
export function colliderDebugPayload(olam, records = []) { const history = olam?.__wallHitHistory || [], last = olam?.__lastInvisibleWallHit || history[history.length - 1] || null; return { last, recent:history.slice(-8), sourceCount:records.length, categories:records.reduce((m,r)=>{ m[r.category || "unknown"] = (m[r.category || "unknown"] || 0) + 1; return m; }, {}) }; }
export default colliderDebugPayload;
