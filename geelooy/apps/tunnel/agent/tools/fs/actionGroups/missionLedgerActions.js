// B"H
const Service = require('../mission/ledger/service.js');

/** B"H: ledger actions keep mission continuity without flooding responses. */
function buildMissionLedgerActions({ config, payload }) {
  const wrap = (action, result) => Promise.resolve(result).then(value => ({ ok: !!value, action, mission:value || null }));
  return {
    missionLedgerCreate: async () => wrap('missionLedgerCreate', Service.create(config, payload)),
    missionLedgerStatus: async () => wrap('missionLedgerStatus', Service.status(config, payload)),
    missionLedgerList: async () => ({ ok:true, action:'missionLedgerList', missions:await Service.list(config) }),
    missionLeaseClaim: async () => wrap('missionLeaseClaim', Service.claimLease(config, payload)),
    missionLeaseHeartbeat: async () => wrap('missionLeaseHeartbeat', Service.heartbeatLease(config, payload)),
    missionCheckpointAdd: async () => wrap('missionCheckpointAdd', Service.addCheckpoint(config, payload)),
    missionEvidenceRecord: async () => wrap('missionEvidenceRecord', Service.recordEvidence(config, payload)),
    missionEmergencyStart: async () => wrap('missionEmergencyStart', Service.emergencyStart(config, payload)),
    missionEmergencyEnd: async () => wrap('missionEmergencyEnd', Service.emergencyEnd(config, payload)),
    missionEmergencyReconcile: async () => wrap('missionEmergencyReconcile', Service.emergencyReconcile(config, payload)),
    missionCompletionGate: async () => { const m = await Service.status(config, payload); return { ok:!!m, action:'missionCompletionGate', gate:m ? Service.gate(m) : null, mission:m }; },
    missionHandoffGenerate: async () => { const m = await Service.status(config, payload); return { ok:!!m, action:'missionHandoffGenerate', handoff:m ? Service.handoff(m) : null }; }
  };
}
module.exports = { buildMissionLedgerActions };
