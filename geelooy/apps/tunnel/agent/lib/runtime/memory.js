// B"H
function snapshot(state, limits, inlineLimit) { const m = process.memoryUsage(); return { rssMB:Math.round(m.rss/1048576), heapUsedMB:Math.round(m.heapUsed/1048576), heapTotalMB:Math.round(m.heapTotal/1048576), externalMB:Math.round(m.external/1048576), inflight:state.inflight.size, queued:state.requestQueue.length, maxInflight:limits.MAX_INFLIGHT, maxQueue:limits.MAX_QUEUE, reconnectAttempt:state.reconnectAttempt, wasEverConnected:state.wasEverConnected, strictOrdering:limits.STRICT_ORDERING, inlineLimitBytes:inlineLimit() }; }
module.exports = { snapshot };
