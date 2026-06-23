// B"H
const crypto = require('crypto');
const { event, addTask } = require('./core.js');

function now() { return new Date().toISOString(); }
function id(prefix) { return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`; }
function arr(v) {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return v.split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
  }
  return [];
}
function obj(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return {};
}
function text(v, fallback = '') { return String(v || fallback || '').trim(); }
function agentId(input = {}) {
  return text(input.agentId || input.logicalAgentId || input.agent || input.fromAgent || input.name || input.agentName || 'agent').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'agent';
}
function ensure(m) {
  m.collaboration ||= {
    id: id('project'),
    missionId: m.id,
    projectRoot: '',
    createdAt: now(),
    updatedAt: now(),
    agents: {},
    messages: [],
    userMessages: [],
    delegations: [],
    claims: [],
    heartbeats: [],
    audits: [],
    invitePrompts: [],
    settings: {
      blockOnUserMessage: true,
      allowContinuePhrases: ['continue', 'go on', 'proceed', 'keep going', 'resume']
    }
  };
  m.collaboration.agents ||= {};
  m.collaboration.messages ||= [];
  m.collaboration.userMessages ||= [];
  m.collaboration.delegations ||= [];
  m.collaboration.claims ||= [];
  m.collaboration.heartbeats ||= [];
  m.collaboration.audits ||= [];
  m.collaboration.invitePrompts ||= [];
  m.collaboration.settings ||= {};
  if (m.collaboration.settings.blockOnUserMessage === undefined) m.collaboration.settings.blockOnUserMessage = true;
  if (!Array.isArray(m.collaboration.settings.allowContinuePhrases)) m.collaboration.settings.allowContinuePhrases = ['continue', 'go on', 'proceed', 'keep going', 'resume'];
  m.collaboration.updatedAt = now();
  return m.collaboration;
}
function publicAgent(agent = {}) {
  return {
    agentId: agent.agentId,
    name: agent.name,
    role: agent.role,
    capabilities: agent.capabilities || [],
    status: agent.status || 'active',
    joinedAt: agent.joinedAt,
    lastSeenAt: agent.lastSeenAt,
    currentClaimIds: agent.currentClaimIds || [],
    currentDelegationIds: agent.currentDelegationIds || []
  };
}
function status(m) {
  const room = ensure(m);
  return {
    projectId: room.id,
    missionId: m.id,
    projectRoot: room.projectRoot,
    agents: Object.values(room.agents).map(publicAgent),
    messages: room.messages.slice(-50),
    userMessages: room.userMessages.slice(-50),
    openUserMessages: openUserMessages(room),
    openDelegations: room.delegations.filter(d => !['done', 'blocked', 'cancelled'].includes(d.status)),
    activeClaims: room.claims.filter(c => c.status === 'active'),
    latestAudit: room.audits[room.audits.length - 1] || null,
    settings: room.settings,
    invitePrompt: inviteText(m, {})
  };
}
function join(m, input = {}) {
  const room = ensure(m);
  const idValue = agentId(input);
  const existing = room.agents[idValue] || {};
  const agent = {
    agentId: idValue,
    name: text(input.agentName || input.name || existing.name || idValue),
    role: text(input.role || existing.role || 'collaborator'),
    capabilities: arr(input.capabilities || existing.capabilities),
    status: 'active',
    joinedAt: existing.joinedAt || now(),
    lastSeenAt: now(),
    currentClaimIds: existing.currentClaimIds || [],
    currentDelegationIds: existing.currentDelegationIds || []
  };
  room.agents[idValue] = agent;
  room.projectRoot = text(input.projectRoot || input.root || input.directory || room.projectRoot);
  const invite = inviteText(m, input);
  room.invitePrompts.push({ id: id('invite'), at: now(), byAgentId: idValue, invite });
  event(m, 'mission_agent_joined', `${agent.name} joined mission collaboration`, { agentId: idValue, role: agent.role });
  return response(m, {
    agent: publicAgent(agent),
    collaboration: status(m),
    invitePrompt: invite,
    instructions: [
      'Optional extra ChatGPT sessions should call missionProjectJoin with this missionId and their own agentId.',
      'Agents should call missionAgentSync before taking work, missionAgentClaim before touching files, and missionAgentMessage or missionAgentDelegate to coordinate.',
      'Agents must include logicalAgentId/agentSessionId in tunnel calls when available and verify returned tunnel/action/vessel/correlation fields.'
    ]
  });
}
function inviteText(m, input = {}) {
  const root = text(input.projectRoot || input.root || input.directory || m.collaboration?.projectRoot || '');
  return [
    `Connect to the existing Awtsmoos mission ${m.id}.`,
    root ? `Use project root: ${root}.` : 'Discover the project root from the tunnel roots if needed.',
    'Call missionProjectJoin with a unique agentId, role, capabilities, and this missionId.',
    'Then call missionAgentSync, read open delegations/claims, claim a non-overlapping chunk with missionAgentClaim, and communicate through missionAgentMessage.',
    'Do not trust ok=true alone; verify action, tunnel, vessel, routeReason, job ids, paths, and correlation fields before using results.'
  ].join(' ');
}
function heartbeat(m, input = {}) {
  const room = ensure(m);
  const idValue = agentId(input);
  if (!room.agents[idValue]) join(m, input);
  const beat = {
    id: id('beat'),
    agentId: idValue,
    at: now(),
    status: text(input.status || 'active'),
    currentAction: text(input.currentAction || input.actionName),
    currentStep: text(input.step || input.currentStep),
    currentFiles: arr(input.files || input.filesToTouch || input.filesTouched),
    note: text(input.note || input.message)
  };
  room.heartbeats.push(beat);
  room.heartbeats = room.heartbeats.slice(-500);
  room.agents[idValue].lastSeenAt = beat.at;
  room.agents[idValue].status = beat.status;
  event(m, 'mission_agent_heartbeat', `${idValue}: ${beat.status}`, { agentId: idValue });
  return response(m, { heartbeat: beat, collaboration: status(m) });
}
function message(m, input = {}) {
  const room = ensure(m);
  const from = agentId(input);
  if (!room.agents[from]) join(m, { ...input, agentId: from });
  const msg = {
    id: id('msg'),
    at: now(),
    fromAgent: from,
    toAgent: text(input.toAgent || input.to || 'all'),
    kind: text(input.kind || 'note'),
    subject: text(input.subject || input.title),
    body: text(input.body || input.message || input.text || input.prompt),
    references: arr(input.references || input.files || input.paths),
    requiresResponse: input.requiresResponse === true || input.requiresResponse === 'true'
  };
  room.messages.push(msg);
  room.messages = room.messages.slice(-1000);
  event(m, 'mission_agent_message', msg.subject || msg.body.slice(0, 120), { messageId: msg.id, fromAgent: from, toAgent: msg.toAgent });
  return response(m, { message: msg, collaboration: status(m) });
}
function userMessage(m, input = {}) {
  const room = ensure(m);
  const body = text(input.body || input.message || input.text || input.prompt);
  const allowContinue = input.allowContinue === true || input.allowContinue === 'true' || impliesContinue(body, room);
  const msg = {
    id: input.messageId || id('user_msg'),
    at: now(),
    from: 'user',
    toAgent: text(input.toAgent || input.to || 'all'),
    subject: text(input.subject || input.title),
    body,
    allowContinue,
    requiresResponse: input.requiresResponse !== false && input.requiresResponse !== 'false' && !allowContinue,
    status: allowContinue ? 'continue' : 'open',
    responses: []
  };
  room.userMessages.push(msg);
  room.messages.push({
    id: msg.id,
    at: msg.at,
    fromAgent: 'user',
    toAgent: msg.toAgent,
    kind: 'user-message',
    subject: msg.subject,
    body: msg.body,
    references: [],
    requiresResponse: msg.requiresResponse
  });
  event(m, 'mission_room_user_message', msg.subject || msg.body.slice(0, 120), { messageId: msg.id, allowContinue, requiresResponse: msg.requiresResponse });
  return response(m, {
    userMessage: msg,
    collaboration: status(m),
    mustCallNext: allowContinue ? { action: 'missionLoopPulse', missionId: m.id, auto: true } : { action: 'missionAgentSync', missionId: m.id, userMessageId: msg.id, blockOnUserMessage: true }
  });
}
function respond(m, input = {}) {
  const room = ensure(m);
  const by = agentId(input);
  const messageId = text(input.messageId || input.userMessageId);
  const target = messageId ? room.userMessages.find(x => x.id === messageId) : openUserMessages(room)[0];
  const reply = {
    id: id('reply'),
    at: now(),
    agentId: by,
    body: text(input.body || input.message || input.text || input.response),
    impliesContinue: input.allowContinue === true || input.allowContinue === 'true' || impliesContinue(input.body || input.message || input.text || input.response, room)
  };
  if (target) {
    target.responses ||= [];
    target.responses.push(reply);
    target.status = reply.impliesContinue ? 'continue' : 'answered';
  }
  room.messages.push({
    id: reply.id,
    at: reply.at,
    fromAgent: by,
    toAgent: 'user',
    kind: 'agent-response',
    subject: target?.subject || '',
    body: reply.body,
    references: [],
    requiresResponse: false
  });
  event(m, 'mission_agent_responded_to_user', reply.body.slice(0, 120), { messageId: target?.id || '', agentId: by });
  return response(m, {
    response: reply,
    userMessage: target || null,
    collaboration: status(m),
    mustCallNext: { action: 'missionLoopPulse', missionId: m.id, auto: true }
  });
}
function settings(m, input = {}) {
  const room = ensure(m);
  room.settings = {
    ...room.settings,
    blockOnUserMessage: input.blockOnUserMessage === undefined ? room.settings.blockOnUserMessage : input.blockOnUserMessage === true || input.blockOnUserMessage === 'true',
    allowContinuePhrases: arr(input.allowContinuePhrases || input.phrases).length ? arr(input.allowContinuePhrases || input.phrases) : room.settings.allowContinuePhrases
  };
  event(m, 'mission_room_settings', 'Room settings updated', room.settings);
  return response(m, { settings: room.settings, collaboration: status(m) });
}
function delegate(m, input = {}) {
  const room = ensure(m);
  const from = agentId(input);
  if (!room.agents[from]) join(m, { ...input, agentId: from });
  const task = {
    id: input.delegationId || id('delegation'),
    at: now(),
    fromAgent: from,
    toAgent: text(input.toAgent || input.to || 'unclaimed'),
    title: text(input.title || input.task || input.goal || 'Delegated mission work'),
    details: text(input.details || input.body || input.message || input.prompt),
    filesToTouch: arr(input.filesToTouch || input.files || input.paths),
    whyEachFile: obj(input.whyEachFile),
    tests: arr(input.tests),
    risks: arr(input.risks),
    status: 'open',
    claimedBy: ''
  };
  room.delegations.push(task);
  addTask(m, `Delegated: ${task.title}`, { status: 'open', kind: 'agent-delegation', id: task.id });
  event(m, 'mission_agent_delegated', task.title, { delegationId: task.id, fromAgent: from, toAgent: task.toAgent });
  return response(m, { delegation: task, collaboration: status(m) });
}
function claim(m, input = {}) {
  const room = ensure(m);
  const by = agentId(input);
  if (!room.agents[by]) join(m, { ...input, agentId: by });
  const files = arr(input.filesToTouch || input.files || input.paths);
  const delegationId = text(input.delegationId || input.taskId);
  const conflicts = activeConflicts(room, by, files);
  const claim = {
    id: input.claimId || id('claim'),
    at: now(),
    agentId: by,
    delegationId,
    title: text(input.title || input.task || 'Claimed work'),
    filesToTouch: files,
    whyEachFile: obj(input.whyEachFile),
    status: conflicts.length ? 'conflict' : 'active',
    conflicts,
    leaseExpiresAt: new Date(Date.now() + Number(input.leaseMs || 3600000)).toISOString(),
    readBeforeWrite: true,
    fullRewriteRequired: true
  };
  room.claims.push(claim);
  room.agents[by].currentClaimIds = [...new Set([...(room.agents[by].currentClaimIds || []), claim.id])];
  if (delegationId) {
    const d = room.delegations.find(x => x.id === delegationId);
    if (d) {
      d.claimedBy = by;
      d.status = conflicts.length ? 'conflict' : 'claimed';
      room.agents[by].currentDelegationIds = [...new Set([...(room.agents[by].currentDelegationIds || []), d.id])];
    }
  }
  event(m, 'mission_agent_claim', claim.title, { claimId: claim.id, agentId: by, conflicts: conflicts.length });
  return response(m, { claim, collaboration: status(m), mustCallNext: conflicts.length ? { action: 'missionAgentAudit', missionId: m.id, agentId: by } : { action: 'missionStepBrainstorm', missionId: m.id, stageTitle: claim.title } });
}
function activeConflicts(room, by, files) {
  const set = new Set(files.map(String));
  if (!set.size) return [];
  return room.claims
    .filter(c => c.status === 'active' && c.agentId !== by)
    .map(c => ({ claimId: c.id, agentId: c.agentId, overlap: (c.filesToTouch || []).filter(f => set.has(String(f))) }))
    .filter(c => c.overlap.length);
}
function sync(m, input = {}) {
  const room = ensure(m);
  const idValue = agentId(input);
  if (input.agentId || input.logicalAgentId || input.agentName) heartbeat(m, { ...input, agentId: idValue, status: input.status || 'syncing' });
  const openUser = room.settings?.blockOnUserMessage === false ? [] : openUserMessages(room).filter(msg => msg.toAgent === 'all' || msg.toAgent === idValue);
  if (openUser.length) {
    return response(m, {
      collaboration: status(m),
      blockingUserMessages: openUser,
      nextInstruction: 'A user message is open in the room. Respond or infer continue before taking more work.',
      mustCallNext: { action: 'missionAgentRespond', missionId: m.id, agentId: idValue, userMessageId: openUser[0].id }
    });
  }
  return response(m, { collaboration: status(m), nextInstruction: 'Pick an unclaimed delegation or queue item, then call missionAgentClaim before touching files.' });
}
function audit(m, input = {}) {
  const room = ensure(m);
  const staleMs = Number(input.staleMs || 15 * 60 * 1000);
  const staleCutoff = Date.now() - staleMs;
  const agents = Object.values(room.agents);
  const staleAgents = agents.filter(a => Date.parse(a.lastSeenAt || a.joinedAt || 0) < staleCutoff).map(publicAgent);
  const conflicts = [];
  for (const claim of room.claims.filter(c => c.status === 'active')) {
    const overlaps = activeConflicts(room, claim.agentId, claim.filesToTouch || []);
    for (const overlap of overlaps) conflicts.push({ claimId: claim.id, agentId: claim.agentId, ...overlap });
  }
  for (const claim of room.claims.filter(c => c.status === 'conflict')) {
    conflicts.push({ claimId: claim.id, agentId: claim.agentId, overlap: claim.conflicts || [], explicit: true });
  }
  const unclaimedDelegations = room.delegations.filter(d => d.status === 'open' && !d.claimedBy);
  const missingHeartbeat = agents.filter(a => !(room.heartbeats || []).some(h => h.agentId === a.agentId)).map(publicAgent);
  const leakageChecks = [
    'Every agent should include unique logicalAgentId and agentSessionId when available.',
    'Every command/read/write result must match requested action, tunnelName, vessel, routeReason, controlRequestId/jobId/path.',
    'If any result mentions another agent, unrelated cwd, unrelated file, or wrong job id, reject it as correlationMismatch.'
  ];
  const record = {
    id: id('audit'),
    at: now(),
    staleAgents,
    conflicts,
    unclaimedDelegations,
    missingHeartbeat,
    leakageChecks,
    ok: conflicts.length === 0,
    recommendation: conflicts.length ? 'resolve_conflicts_before_writes' : 'continue_parallel_work'
  };
  room.audits.push(record);
  room.audits = room.audits.slice(-200);
  event(m, 'mission_agent_audit', record.recommendation, { auditId: record.id, conflicts: conflicts.length });
  return response(m, { audit: record, collaboration: status(m) });
}
function complete(m, input = {}) {
  const room = ensure(m);
  const by = agentId(input);
  const claimId = text(input.claimId);
  const delegationId = text(input.delegationId || input.taskId);
  for (const claim of room.claims) if ((!claimId || claim.id === claimId) && claim.agentId === by) claim.status = 'done';
  for (const d of room.delegations) if (d.id === delegationId || (claimId && room.claims.find(c => c.id === claimId && c.delegationId === d.id))) d.status = 'done';
  event(m, 'mission_agent_complete', `${by} completed claimed work`, { agentId: by, claimId, delegationId });
  return response(m, { collaboration: status(m), nextInstruction: 'Call missionAgentAudit, then missionLoopPulse to discover the next improvement.' });
}
function response(m, extra = {}) {
  const next = extra.mustCallNext || { action: 'missionAgentSync', missionId: m.id, auto: true };
  return {
    ...extra,
    next,
    mustCallNext: next,
    finalAnswerAllowed: false,
    mustContinue: true
  };
}
function openUserMessages(room) {
  return (room.userMessages || []).filter(msg => msg.requiresResponse && msg.status === 'open' && !msg.allowContinue);
}
function impliesContinue(value, room) {
  const textValue = String(value || '').toLowerCase();
  const phrases = room.settings?.allowContinuePhrases || ['continue', 'go on', 'proceed', 'keep going', 'resume'];
  return phrases.some(phrase => textValue.includes(String(phrase).toLowerCase()));
}

module.exports = { ensure, status, join, heartbeat, message, userMessage, respond, settings, delegate, claim, sync, audit, complete, inviteText };
