/* B"H */
export function createTunnelPublisher(input = {}) { return { kind:'TunnelPublisher', base:input.base || 'http://127.0.0.1:3977', sessionId:input.sessionId || null, queue:input.queue || [] }; }
export function enqueueTunnelSegment(publisher, segment) { publisher.queue.push(segment); return segment; }
export function markTunnelStarted(publisher, sessionId) { publisher.sessionId = sessionId; return publisher; }
export function flushTunnelQueue(publisher, sender = async x => x) { const queued = [...publisher.queue]; publisher.queue.length = 0; return Promise.all(queued.map(sender)); }
