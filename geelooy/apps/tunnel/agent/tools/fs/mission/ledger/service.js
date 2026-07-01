// B"H
const Store = require('./store.js');
const Model = require('./model.js');
const Gate = require('./gate.js');
const Handoff = require('./handoff.js');

/**
 * B"H
 * The service is the mission soul made practical: create, lease, checkpoint,
 * evidence, emergency, handoff, and completion gate in small durable steps.
 */
async function create(config, payload) { return Store.save(config, Model.createMission(payload)); }
async function status(config, payload) { return payload.missionId ? await Store.load(config, payload.missionId) : (await Store.list(config))[0] || null; }
async function list(config) { return Store.list(config); }
async function withMission(config, missionId, fn) { const m = await Store.load(config, missionId); if (!m) return null; return Store.save(config, Model.touch(fn(m))); }
async function claimLease(config, payload) { return withMission(config, payload.missionId, m => { const l = Model.lease(payload); m.leases.push(l); m.agents.push({ leaseId:l.leaseId, agentLabel:l.agentLabel }); return m; }); }
async function heartbeatLease(config, payload) { return withMission(config, payload.missionId, m => { const l = m.leases.find(x => x.leaseId === payload.leaseId); if (l) l.lastHeartbeatAt = new Date().toISOString(); return m; }); }
async function addCheckpoint(config, payload) { return withMission(config, payload.missionId, m => { m.checkpoints.push(Model.checkpoint(payload)); return m; }); }
async function recordEvidence(config, payload) { return withMission(config, payload.missionId, m => { const ev = Model.evidence(payload); m.evidence.push(ev); const c = m.checkpoints.find(x => x.checkpointId === ev.checkpointId); if (c) { c.evidenceIds.push(ev.evidenceId); if (payload.complete !== false) c.status = 'complete'; } return m; }); }
async function emergencyStart(config, payload) { return withMission(config, payload.missionId, m => { m.emergency = { status:'active', reason:payload.reason || 'unspecified', scope:payload.scope || {}, startedAt:new Date().toISOString() }; return m; }); }
async function emergencyEnd(config, payload) { return withMission(config, payload.missionId, m => { if (m.emergency) Object.assign(m.emergency, { status:'ended', endedAt:new Date().toISOString() }); return m; }); }
async function emergencyReconcile(config, payload) { return withMission(config, payload.missionId, m => { m.checkpoints.push(Model.checkpoint({ phase:'reconcile', plainEnglish:payload.plainEnglish || 'Reconcile emergency changes.', evidenceRequired:['summary','diff'], required:true })); if (m.emergency) m.emergency.reconciledAt = new Date().toISOString(); return m; }); }
function gate(mission) { return Gate.completionGate(mission); }
function handoff(mission) { return Handoff.handoff(mission); }
module.exports = { create, status, list, claimLease, heartbeatLease, addCheckpoint, recordEvidence, emergencyStart, emergencyEnd, emergencyReconcile, gate, handoff };
