// B"H
function parse(value) { if (!value) return null; if (typeof value === 'string') { try { return JSON.parse(value); } catch { return null; } } return value; }
function first(...items) { return items.find(x => x && typeof x === 'object' && x.action); }
function extract(result = {}) { return first(result.mustCallNext, result.scheduler?.mustCallNext, result.next?.mustCallNext, result.nextRequiredAction, result.selfImprovement?.nextRequiredAction); }
function initial(payload = {}) { return parse(payload.next || payload.mustCallNext) || (payload.nextAction ? { action: payload.nextAction, missionId: payload.missionId } : null) || (payload.missionId ? { action: 'missionNext', missionId: payload.missionId } : null); }
function clean(next = {}) { const { type, id, ok, actualAction, requestAction, queueStats, queuedMs, ...rest } = next; return rest; }
module.exports = { parse, extract, initial, clean };
