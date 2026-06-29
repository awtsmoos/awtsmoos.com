// B"H
function createRoomLoop(env) {
  function inbox(m, input = {}) {
    const room = env.RoomState.ensure(m, input);
    const agentId = env.RoomState.agentId(input);
    const mine = v => !v || v === 'all' || v === agentId || v === 'any_agent';
    return { agentId, messages: room.messages.filter(x => mine(x.toAgent) || x.fromAgent === agentId).slice(-50), interrupts: (room.interrupts || []).filter(x => x.status === 'blocking' && mine(x.toAgent)).slice(-20), claims: (room.claims || []).filter(x => x.agentId === agentId && x.status === 'active'), subMissions: (room.subMissions || []).filter(x => x.agentId === agentId), fileClaims: (room.fileClaims || []).filter(x => x.agentId === agentId && x.status === 'active'), mustCallNext: env.RoomInterrupts.mustCallNext(m, env) };
  }
  async function wakeAgent(config, m, input = {}) {
    const found = await env.roomFindActive(config, input);
    const agent = env.roomJoin(m, input);
    const brainstorm = env.roomBrainstorm(m, { ...input, count: input.brainstormCount || 12, prompt: input.prompt || 'Wake, sync, inspect inbox, and choose next room action.' });
    const box = inbox(m, input);
    const pulse = loopPulse(m, input);
    return { ok: true, found, agent, brainstorm, inbox: box, pulse, nextRequiredAction: pulse.mustCallNext || box.mustCallNext || { action: 'missionRoomLoopPulse', missionId: m.id, agentId: agent.agentId } };
  }
  function loopPulse(m, input = {}) {
    const room = env.RoomState.ensure(m, input);
    const agentId = env.RoomState.agentId(input);
    const box = inbox(m, input);
    const blockers = box.interrupts;
    if (blockers.length) return pulse('blocked_interrupt', agentId, { inbox: box, mustCallNext: env.RoomInterrupts.mustCallNext(m, env) });
    const conflicts = fileConflicts(m, input);
    if (conflicts.length) return pulse('blocked_file_conflict', agentId, { conflicts, mustCallNext: { action: 'missionRoomReleaseFile', missionId: m.id, agentId, claimId: conflicts[0].claimIds[1] } });
    const claim = box.claims[0] || room.claims.find(x => x.status === 'active');
    const next = claim ? { action: 'missionRoomHeartbeat', missionId: m.id, agentId, status: 'working', currentWork: claim.title } : { action: 'missionRoomBrainstorm', missionId: m.id, agentId, prompt: 'No active claim. Brainstorm and propose/claim work.' };
    const receipt = { id: env.RoomState.id('room_loop'), at: env.RoomState.now(), agentId, stage: claim ? 'execute_claim' : 'brainstorm', next };
    room.loopReceipts ||= [];
    room.loopReceipts.push(receipt);
    meta(env, input, m, 'room_loop_pulse', { agentId, message: receipt.stage, payload: receipt });
    return pulse(receipt.stage, agentId, { receipt, inbox: box, mustCallNext: next });
  }
  function watchdog(m, input = {}) {
    const room = env.RoomState.ensure(m, input);
    const maxAgeMs = Number(input.maxAgeMs ?? input.staleAfterMs ?? 15 * 60 * 1000);
    const now = Date.now();
    const stale = Object.values(room.agents || {}).filter(agent => now - Date.parse(agent.lastSeenAt || agent.joinedAt || 0) >= maxAgeMs).map(agent => ({ agentId: agent.agentId, lastSeenAt: agent.lastSeenAt, ageMs: now - Date.parse(agent.lastSeenAt || agent.joinedAt || 0) }));
    const out = { ok: true, stale, mustCallNext: stale[0] ? { action: 'missionRoomRecoverStaleAgent', missionId: m.id, agentId: input.agentId || 'agent', staleAgentId: stale[0].agentId } : null };
    meta(env, input, m, 'room_watchdog', { agentId: input.agentId || 'watchdog', message: `${stale.length} stale agents`, payload: out });
    return out;
  }
  function recoverStaleAgent(m, input = {}) {
    const room = env.RoomState.ensure(m, input);
    const staleAgentId = env.RoomState.text(input.staleAgentId || input.targetAgentId || 'agent');
    const agent = room.agents[staleAgentId];
    if (agent) { agent.status = 'recovered_by_peer'; agent.recoveredAt = env.RoomState.now(); agent.recoveredBy = env.RoomState.agentId(input); }
    const pack = { id: env.RoomState.id('handoff'), at: env.RoomState.now(), staleAgentId, recoveredBy: env.RoomState.agentId(input), messages: room.messages.filter(x => x.fromAgent === staleAgentId || x.toAgent === staleAgentId).slice(-10), claims: room.claims.filter(x => x.agentId === staleAgentId), subMissions: room.subMissions.filter(x => x.agentId === staleAgentId) };
    room.handoffs ||= [];
    room.handoffs.push(pack);
    return { ok: true, handoff: pack };
  }
  function claimFile(m, input = {}) {
    const room = env.RoomState.ensure(m, input);
    room.fileClaims ||= [];
    const claim = { id: input.claimId || env.RoomState.id('file_claim'), at: env.RoomState.now(), agentId: env.RoomState.agentId(input), file: env.RoomState.text(input.file || input.path), purpose: env.RoomState.text(input.purpose || input.reason || 'work'), status: 'active' };
    room.fileClaims.push(claim);
    meta(env, input, m, 'room_file_claim', { agentId: claim.agentId, message: claim.file, payload: claim });
    return { ok: true, claim, conflicts: fileConflicts(m, input) };
  }
  function releaseFile(m, input = {}) {
    const room = env.RoomState.ensure(m, input);
    const target = (room.fileClaims || []).find(x => x.id === input.claimId || (x.file === input.file && x.agentId === env.RoomState.agentId(input) && x.status === 'active'));
    if (!target) return { ok: false, error: 'file_claim_not_found' };
    target.status = 'released';
    target.releasedAt = env.RoomState.now();
    target.releaseNote = env.RoomState.text(input.note || 'released');
    return { ok: true, claim: target, conflicts: fileConflicts(m, input) };
  }
  function fileConflicts(m) {
    const active = (m.room?.fileClaims || []).filter(x => x.status === 'active');
    const groups = new Map();
    for (const c of active) groups.set(c.file, [...(groups.get(c.file) || []), c]);
    return [...groups.entries()].filter(([, list]) => new Set(list.map(x => x.agentId)).size > 1).map(([file, list]) => ({ file, agents: list.map(x => x.agentId), claimIds: list.map(x => x.id) }));
  }
  function mergeCourt(m, input = {}) {
    const room = env.RoomState.ensure(m, input);
    const issues = [];
    if ((room.interrupts || []).some(x => x.status === 'blocking')) issues.push('open_interrupts');
    const stale = watchdog(m, { ...input, staleAfterMs: input.staleAfterMs ?? 15 * 60 * 1000 }).stale;
    if (stale.length) issues.push('stale_agents');
    if (fileConflicts(m, input).length) issues.push('file_conflicts');
    if ((room.subMissions || []).some(x => x.status !== 'done' && input.requireSubMissionsDone === true)) issues.push('unfinished_sub_missions');
    const ok = issues.length === 0;
    const court = { ok, issues, verdict: ok ? 'merge_allowed' : 'merge_blocked', mustCallNext: ok ? { action: 'missionRoomMergeReports', missionId: m.id } : nextForIssue(m, issues[0]) };
    room.mergeCourts ||= [];
    room.mergeCourts.push({ ...court, at: env.RoomState.now() });
    return court;
  }
  function nextForIssue(m, issue) {
    if (issue === 'open_interrupts') return env.RoomInterrupts.mustCallNext(m, env);
    if (issue === 'file_conflicts') return { action: 'missionRoomReleaseFile', missionId: m.id };
    if (issue === 'stale_agents') return { action: 'missionRoomWatchdog', missionId: m.id };
    return { action: 'missionRoomStatus', missionId: m.id };
  }
  function pulse(stage, agentId, extra) { return { ok: true, stage, agentId, finalAnswerAllowed: false, mustContinue: true, ...extra }; }
  function meta(env, input, m, kind, data) { return env.MetadataStore?.record({ root: input.__configRoot || input.projectRoot, metadataRoot: input.__metadataRoot }, m, kind, data); }
  return { inbox, wakeAgent, loopPulse, watchdog, recoverStaleAgent, claimFile, releaseFile, fileConflicts, mergeCourt };
}
module.exports = { createRoomLoop };
