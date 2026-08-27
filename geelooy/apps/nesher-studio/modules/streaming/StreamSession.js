/* B"H */
import { createStreamHealth, updateStreamHealth } from './StreamHealth.js';
export function createStreamSession(input = {}) { return { id:input.id || `stream-${Date.now()}`, kind:'StreamSession', providerId:input.providerId || 'generic-hls', status:input.status || 'idle', startedAt:null, stoppedAt:null, health:createStreamHealth(input.health || {}), segments:[] }; }
export function startStreamSession(session) { session.status = 'running'; session.startedAt = Date.now(); updateStreamHealth(session.health, { state:'running' }); return session; }
export function stopStreamSession(session) { session.status = 'stopped'; session.stoppedAt = Date.now(); updateStreamHealth(session.health, { state:'stopped' }); return session; }
export function attachStreamSegment(session, segment) { session.segments.push(segment); updateStreamHealth(session.health, { uploadedBytes:session.segments.reduce((a,s)=>a+(s.bytes||0),0) }); return segment; }
