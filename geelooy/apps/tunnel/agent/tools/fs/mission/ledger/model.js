// B"H
const { id, at } = require('./ids.js');

/**
 * B"H
 * A mission is not a shout loop. It is a ledger of leases, checkpoints,
 * evidence, workers, receipts, and unresolved pieces awaiting truth.
 */
function createMission(payload = {}) {
  const time = at();
  return clean({
    BH: 'B"H', missionId: payload.missionId || id('mission'), title: payload.title || 'Untitled mission',
    projectRoot: payload.projectRoot || payload.root || '', status: 'active', phase: payload.phase || 'inspect',
    createdAt: time, updatedAt: time, agents: [], leases: [], checkpoints: [], evidence: [], receipts: [],
    workers: [], unresolved: [], emergency: null, filesTouched: [], testsRun: []
  });
}

function lease(payload = {}) {
  const now = at();
  const ttl = Math.max(60000, Math.min(Number(payload.leaseMs || 3600000), 24 * 3600000));
  return clean({ leaseId: payload.leaseId || id('lease'), agentLabel: payload.agentLabel || payload.logicalAgentId || 'agent', claimedAt: now, lastHeartbeatAt: now, expiresAt: new Date(Date.now() + ttl).toISOString(), focus: payload.focus || '', status: 'active' });
}

function checkpoint(payload = {}) {
  return clean({ checkpointId: payload.checkpointId || id('chk'), phase: payload.phase || 'verify', required: payload.required !== false, plainEnglish: payload.plainEnglish || payload.title || 'Record evidence.', evidenceRequired: Array.isArray(payload.evidenceRequired) ? payload.evidenceRequired : [], status: 'pending', createdAt: at(), evidenceIds: [] });
}

function evidence(payload = {}) {
  return clean({ evidenceId: payload.evidenceId || id('ev'), checkpointId: payload.checkpointId || '', kind: payload.kind || 'note', claim: payload.claim || '', proof: payload.proof || {}, createdAt: at() });
}

function touch(mission, phase) { mission.updatedAt = at(); if (phase) mission.phase = phase; return mission; }
function clean(obj) { for (const k of Object.keys(obj)) if (obj[k] === undefined || obj[k] === '') delete obj[k]; return obj; }
module.exports = { createMission, lease, checkpoint, evidence, touch };
