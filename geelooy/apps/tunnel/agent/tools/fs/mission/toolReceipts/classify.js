// B"H
function kind(action = '') { if (/read|grep|find|list|tree/.test(action)) return 'inspection'; if (/command|test|check/.test(action)) return 'verification'; if (/write|patch|move|delete/.test(action)) return 'implementation'; return 'tool'; }
function summary(payload = {}, result = {}) { return { action: result.action || payload.action, ok: result.ok !== false, kind: kind(result.action || payload.action), path: payload.p || payload.path || '', jobId: result.jobId || payload.jobId || '', at: new Date().toISOString() }; }
module.exports = { kind, summary };
