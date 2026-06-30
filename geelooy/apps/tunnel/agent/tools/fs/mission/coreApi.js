// B"H
const D = require('./coreDeps.js');
const CORE = 'DIR id clean dir file ensure create load save all shape event addTask completeTask evidence counts dod continuation scriptFor scriptText question answerInputText parseAnswer ask applyChoice answer nextStep missionGateResponse autoAnswer discover attachJob heartbeat verify supervise report timeline graph autonomyPolicy finalizationPolicy askHumanDecision checkpoint selfMailDraft brainstorm autopilot queueStatus queueAdd queueComplete cycle finalizeVerdict finalize nextRequiredAction'.split(' ');
const ROOM = 'roomCreate roomJoin roomStatus roomMessage roomUserMessage roomBrainstorm roomRecoverInterrupt roomBlockingInterrupts roomFindActive roomDiscoverAgents roomInviteAgent roomProposeSplit roomAcceptSplit roomCreateSubMissions roomClaimTask roomHeartbeat roomMergeReports roomAgreementStatus roomSimulate roomRealChatSimulate roomInbox roomWakeAgent roomLoopPulse roomWatchdog roomRecoverStaleAgent roomClaimFile roomReleaseFile roomFileConflicts roomMergeCourt roomRuntimeStatus'.split(' ');
const SELF = 'selfImproveStart selfImprovePulse selfImproveSummit selfImproveCourt selfImproveStatus selfImproveTrustScore'.split(' ');
const OS = 'missionOsSeed missionOsStatus missionOsAddNode missionOsUpdateNode missionOsReceipt missionOsNext missionOsReleaseCourt missionOsCycleCheck missionOsConstitution missionOsPrompt missionOsKeepGoing missionOsSteer'.split(' ');
const LIBS = 'Lease Constitution Guidance StrictAnswer Innovation AnswerLedger ContinuationQueue CycleArtifacts FinalizePolicy EarlyFinalGuard ProtocolStages ProtocolPrompts ProtocolArtifacts ProtocolScoring ProtocolGates ProtocolQueue ProtocolReview ProtocolFinalizationGuard RoomState RoomMessages RoomAgents RoomDelegation RoomAgreement RoomSubMissions RoomSimulator RoomInterrupts RoomDiscovery RoomRuntime MetadataStore SelfImprove MissionOS createRoomLoop'.split(' ');

/** B"H — Export only named gates so callers see order instead of fog. */
function buildApi(env) {
  const api = pick(env, CORE);
  Object.assign(api, aliases(env), pick(env, ROOM), pick(env, SELF), pick(env, OS), pick(env, LIBS));
  api.metadataStatus = env.MetadataStore.status;
  return api;
}
function aliases(env) {
  return { protocolDefaults:env.defaults, protocolStart:env.start, protocolStage:env.runStage,
    protocolAnswer:env.protocolAnswer, protocolNext:env.protocolNext, protocolStatus:env.protocolStatus };
}
function pick(source, names) { return Object.fromEntries(names.map(name => [name, source[name] ?? D[name]])); }
module.exports = { buildApi };
