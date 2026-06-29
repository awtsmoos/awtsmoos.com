// B"H
const Lease = require('./lease.js');
const Constitution = require('./constitution.js');
const StrictAnswer = require('./strictAnswer.js');
const Innovation = require('./innovationPolicy.js');
const AnswerLedger = require('./answerLedger.js');
const ContinuationQueue = require('./continuationQueue.js');
const CycleArtifacts = require('./cycleArtifacts.js');
const FinalizePolicy = require('./finalizePolicy.js');
const EarlyFinalGuard = require('./earlyFinalGuard.js');
const ProtocolStages = require('./protocolStages.js');
const ProtocolPrompts = require('./protocolPrompts.js');
const ProtocolArtifacts = require('./protocolArtifacts.js');
const ProtocolScoring = require('./protocolScoring.js');
const ProtocolGates = require('./protocolGates.js');
const ProtocolQueue = require('./protocolQueue.js');
const ProtocolReview = require('./protocolReview.js');
const ProtocolFinalizationGuard = require('./protocolFinalizationGuard.js');
const RoomState = require('./roomState.js');
const RoomMessages = require('./roomMessages.js');
const RoomAgents = require('./roomAgents.js');
const RoomDelegation = require('./roomDelegation.js');
const RoomAgreement = require('./roomAgreement.js');
const RoomSubMissions = require('./roomSubMissions.js');
const RoomSimulator = require('./roomSimulator.js');
const RoomInterrupts = require('./roomInterrupts.js');
const RoomDiscovery = require('./roomDiscovery.js');
const MetadataStore = require('./metadataStore.js');
const MissionOS = require('./missionOs/index.js');
const { createRoomLoop } = require('./roomLoop.js');
const SelfImprove = require('./selfImprove/index.js');
const Utils = require('./coreUtils.js');
const { createState } = require('./coreState.js');
const { createRecords } = require('./coreRecords.js');
const { createStorage } = require('./coreStorage.js');
const { createReports } = require('./coreReports.js');
const { createGates } = require('./coreGates.js');
const { createWork } = require('./coreWork.js');
const { createAnswers } = require('./coreAnswers.js');
const { createSteps } = require('./coreSteps.js');
const { createAutonomy } = require('./coreAutonomy.js');
const { createFinalization } = require('./finalization.js');
const { createBossProtocol } = require('./bossProtocol.js');
const { createRoomEngine } = require('./roomEngine.js');
const env = { ...Utils, Lease, Constitution, StrictAnswer, Innovation, AnswerLedger, ContinuationQueue, CycleArtifacts, FinalizePolicy, EarlyFinalGuard, ProtocolStages, ProtocolPrompts, ProtocolArtifacts, ProtocolScoring, ProtocolGates, ProtocolQueue, ProtocolReview, ProtocolFinalizationGuard, RoomState, RoomMessages, RoomAgents, RoomDelegation, RoomAgreement, RoomSubMissions, RoomSimulator, RoomInterrupts, RoomDiscovery, MetadataStore, SelfImprove, MissionOS, createRoomLoop };
Object.assign(env, createState(env), createRecords(env), createStorage(env), createReports(env), createGates(env), createWork(env), createAnswers(env), createBossProtocol(env));
env.BossProtocol = { defaults: env.defaults, ensure: env.ensureBossProtocol || env.ensure, start: env.start, runStage: env.runStage, answer: env.protocolAnswer, next: env.protocolNext, status: env.protocolStatus };
env.roomLoop = createRoomLoop(env);
Object.assign(env, createRoomEngine(env));
env.selfImproveStart = (m, input) => env.SelfImprove.start(m, input);
env.selfImprovePulse = (m, input) => env.SelfImprove.pulse(m, input);
env.selfImproveSummit = (m, input) => env.SelfImprove.summit(m, input);
env.selfImproveCourt = (m) => env.SelfImprove.verdict(m);
env.selfImproveStatus = (m) => env.SelfImprove.status(m);
env.selfImproveTrustScore = (m) => ({ score:(m.selfImproveReceipts||[]).reduce((a,r)=>a+(r.noveltyScore||0)+(r.proof?2:0),0), receipts:(m.selfImproveReceipts||[]).length, agents:Object.keys(m.room?.agents||{}).length });
env.missionOsSeed = (m, input) => env.MissionOS.seed(m, input);
env.missionOsStatus = (m) => env.MissionOS.status(m);
env.missionOsAddNode = (m, input) => env.MissionOS.addNode(m, input);
env.missionOsUpdateNode = (m, input) => env.MissionOS.updateNode(m, input);
env.missionOsReceipt = (m, input) => env.MissionOS.recordReceipt(m, input);
env.missionOsNext = (m) => env.MissionOS.next(m);
env.missionOsReleaseCourt = (m) => env.MissionOS.releaseCourt(m);
env.missionOsCycleCheck = (m, input) => env.MissionOS.cycleCheck(m, input);
env.missionOsConstitution = (m) => env.MissionOS.constitution(m);
env.missionOsPrompt = (m, input) => env.MissionOS.prompt(m, input);
env.missionOsKeepGoing = (m, input) => env.MissionOS.keepGoing(m, input);
env.missionOsSteer = (m, input) => env.MissionOS.steer(m, input);
Object.assign(env, createFinalization(env), createSteps(env), createAutonomy(env));
const api = { DIR: env.DIR, id: env.id, clean: env.clean, dir: env.dir, file: env.file, ensure: env.ensure, create: env.create, load: env.load, save: env.save, all: env.all, shape: env.shape, event: env.event, addTask: env.addTask, completeTask: env.completeTask, evidence: env.evidence, counts: env.counts, dod: env.dod, continuation: env.continuation, scriptFor: env.scriptFor, scriptText: env.scriptText, question: env.question, answerInputText: env.answerInputText, parseAnswer: env.parseAnswer, ask: env.ask, applyChoice: env.applyChoice, answer: env.answer, nextStep: env.nextStep, missionGateResponse: env.missionGateResponse, autoAnswer: env.autoAnswer, discover: env.discover, attachJob: env.attachJob, heartbeat: env.heartbeat, verify: env.verify, supervise: env.supervise, report: env.report, timeline: env.timeline, graph: env.graph, autonomyPolicy: env.autonomyPolicy, finalizationPolicy: env.finalizationPolicy, askHumanDecision: env.askHumanDecision, checkpoint: env.checkpoint, selfMailDraft: env.selfMailDraft, brainstorm: env.brainstorm, autopilot: env.autopilot, queueStatus: env.queueStatus, queueAdd: env.queueAdd, queueComplete: env.queueComplete, cycle: env.cycle, finalizeVerdict: env.finalizeVerdict, finalize: env.finalize, nextRequiredAction: env.nextRequiredAction };
Object.assign(api, { protocolDefaults: env.defaults, protocolStart: env.start, protocolStage: env.runStage, protocolAnswer: env.protocolAnswer, protocolNext: env.protocolNext, protocolStatus: env.protocolStatus, roomCreate: env.roomCreate, roomJoin: env.roomJoin, roomStatus: env.roomStatus, roomMessage: env.roomMessage, roomUserMessage: env.roomUserMessage, roomBrainstorm: env.roomBrainstorm, roomRecoverInterrupt: env.roomRecoverInterrupt, roomBlockingInterrupts: env.roomBlockingInterrupts, roomFindActive: env.roomFindActive, roomDiscoverAgents: env.roomDiscoverAgents, roomInviteAgent: env.roomInviteAgent, roomProposeSplit: env.roomProposeSplit, roomAcceptSplit: env.roomAcceptSplit, roomCreateSubMissions: env.roomCreateSubMissions, roomClaimTask: env.roomClaimTask, roomHeartbeat: env.roomHeartbeat, roomMergeReports: env.roomMergeReports, roomAgreementStatus: env.roomAgreementStatus, roomSimulate: env.roomSimulate, roomRealChatSimulate: env.roomRealChatSimulate, roomInbox: env.roomInbox, roomWakeAgent: env.roomWakeAgent, roomLoopPulse: env.roomLoopPulse, roomWatchdog: env.roomWatchdog, roomRecoverStaleAgent: env.roomRecoverStaleAgent, roomClaimFile: env.roomClaimFile, roomReleaseFile: env.roomReleaseFile, roomFileConflicts: env.roomFileConflicts, roomMergeCourt: env.roomMergeCourt });
Object.assign(api, { selfImproveStart: env.selfImproveStart, selfImprovePulse: env.selfImprovePulse, selfImproveSummit: env.selfImproveSummit, selfImproveCourt: env.selfImproveCourt, selfImproveStatus: env.selfImproveStatus, selfImproveTrustScore: env.selfImproveTrustScore, metadataStatus: env.MetadataStore.status, missionOsSeed: env.missionOsSeed, missionOsStatus: env.missionOsStatus, missionOsAddNode: env.missionOsAddNode, missionOsUpdateNode: env.missionOsUpdateNode, missionOsReceipt: env.missionOsReceipt, missionOsNext: env.missionOsNext, missionOsReleaseCourt: env.missionOsReleaseCourt, missionOsCycleCheck: env.missionOsCycleCheck, missionOsConstitution: env.missionOsConstitution, missionOsPrompt: env.missionOsPrompt, missionOsKeepGoing: env.missionOsKeepGoing, missionOsSteer: env.missionOsSteer });
Object.assign(api, { Lease, Constitution, StrictAnswer, Innovation, AnswerLedger, ContinuationQueue, CycleArtifacts, FinalizePolicy, EarlyFinalGuard, ProtocolStages, ProtocolPrompts, ProtocolArtifacts, ProtocolScoring, ProtocolGates, ProtocolQueue, ProtocolReview, ProtocolFinalizationGuard, RoomState, RoomMessages, RoomAgents, RoomDelegation, RoomAgreement, RoomSubMissions, RoomSimulator, RoomInterrupts, RoomDiscovery, MetadataStore, SelfImprove, MissionOS, createRoomLoop });
/**
 * B"H
 * The core is a palace with many gates. A new gate was carved without
 * collapsing the older walls: MissionOS stores the graph, receipts, court,
 * cycle hashes, and phase breath where autonomous work can survive restart.
 */
module.exports = api;
