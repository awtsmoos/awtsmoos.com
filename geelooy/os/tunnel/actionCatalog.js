// B"H
/**
 * B"H
 * The OS sees the tunnel as a filesystem of possible deeds.
 * Each action remains a name, a schema, and a safe payload builder; the browser
 * may request native work, but never pretends the browser itself is native.
 */
export const ACTIONS = Object.freeze([
  action('tunnelDoctor', 'control', 'Inspect native tunnel health.'),
  action('tunnelLivenessTimeline', 'control', 'Read recent liveness events.'),
  action('agentDoctor', 'control', 'Inspect local agent readiness.'),
  action('list', 'fs', 'List files or virtual directories.', { path: '.' }),
  action('read', 'fs', 'Read a file through the tunnel.', { path: '.', maxChars: 12000 }),
  action('write', 'fs', 'Rewrite a complete file through the tunnel.', { path: '', content: '' }),
  action('tree', 'fs', 'Read a directory tree.', { path: '.', depth: 2 }),
  action('grep', 'fs', 'Search text under a path.', { path: '.', query: '' }),
  action('commandRun', 'native-command', 'Run a native command through a selected native tunnel.', { command: '', cwd: '.', responseMode: 'compact' }),
  action('commandJobStatus', 'native-command', 'Poll a command worker job.', { jobId: '' }),
  action('commandWait', 'native-command', 'Wait briefly for a command worker job.', { jobId: '', waitTimeoutMs: 25000 }),
  action('commandCancel', 'native-command', 'Cancel a command worker job.', { jobId: '' }),
  action('chromeStatus', 'browser-automation', 'Inspect Chrome automation state.'),
  action('browserConsoleTriage', 'browser-automation', 'Summarize browser console errors.'),
  action('previewList', 'preview', 'List available previews.'),

  action('contentPostCreate', 'content', 'Create a post as the API-key user.', { operation: 'post.create', apiKey: '', params: {} }),
  action('contentPostEdit', 'content', 'Edit your own post as the API-key user.', { operation: 'post.edit', apiKey: '', params: {} }),
  action('contentPostDelete', 'content', 'Delete your own post as the API-key user.', { operation: 'post.delete', apiKey: '', params: {} }),
  action('contentPostList', 'content', 'List posts visible to the API-key user.', { operation: 'post.list', apiKey: '', params: {} }),
  action('contentPostGet', 'content', 'Read one post with translation status.', { operation: 'post.get', apiKey: '', params: {} }),
  action('contentHeichelCreate', 'content', 'Create a heichel as the API-key user.', { operation: 'heichel.create', apiKey: '', params: {} }),
  action('contentHeichelEdit', 'content', 'Edit your own heichel as the API-key user.', { operation: 'heichel.edit', apiKey: '', params: {} }),
  action('contentHeichelDelete', 'content', 'Delete your own heichel as the API-key user.', { operation: 'heichel.delete', apiKey: '', params: {} }),
  action('contentHeichelList', 'content', 'List heichelos visible to the API-key user.', { operation: 'heichel.list', apiKey: '', params: {} }),
  action('contentSearch', 'content', 'Search the Awtsmoos corpus.', { operation: 'search', apiKey: '', params: {} }),
  action('contentCorpora', 'content', 'List available corpora and libraries.', { operation: 'corpora', apiKey: '', params: {} }),
  action('contentTranslateSubmit', 'content', 'Submit text for translation.', { operation: 'translate.submit', apiKey: '', params: {} }),
  action('contentTranslationStatus', 'content', 'Check translation job status.', { operation: 'translation.status', apiKey: '', params: {} }),
  action('contentGlossary', 'content', 'Read the translation glossary.', { operation: 'glossary', apiKey: '', params: {} }),
  action('tunnelHello', 'onboarding', 'Say hi — the tunnel introduces itself and teaches you in one breath.', { text: 'hi' }),

  action('missionLedgerCreate', 'mission-ledger', 'Create a durable mission ledger.', { title: '', projectRoot: '' }),
  action('missionLedgerStatus', 'mission-ledger', 'Read a durable mission ledger.', { missionId: '' }),
  action('missionLedgerList', 'mission-ledger', 'List durable mission ledgers.'),
  action('missionLeaseClaim', 'mission-ledger', 'Claim an agent lease.', { missionId: '', agentLabel: '', focus: '' }),
  action('missionLeaseHeartbeat', 'mission-ledger', 'Refresh an agent lease heartbeat.', { missionId: '', leaseId: '' }),
  action('missionCheckpointAdd', 'mission-ledger', 'Add a mission checkpoint.', { missionId: '', plainEnglish: '', evidenceRequired: [] }),
  action('missionEvidenceRecord', 'mission-ledger', 'Record evidence for a checkpoint.', { missionId: '', checkpointId: '', claim: '', proof: {} }),
  action('missionCompletionGate', 'mission-ledger', 'Check whether mission completion is allowed.', { missionId: '' }),
  action('missionEmergencyStart', 'mission-ledger', 'Start bounded emergency mode.', { missionId: '', reason: '', scope: {} }),
  action('missionEmergencyEnd', 'mission-ledger', 'End emergency mode.', { missionId: '' }),
  action('missionEmergencyReconcile', 'mission-ledger', 'Create an emergency reconciliation checkpoint.', { missionId: '' }),
  action('missionStatus', 'mission', 'Read current mission state.'),
  action('missionHandoffGenerate', 'mission', 'Generate a compact mission handoff.'),

  action('missionBoardList', 'mission-board', 'List the mission board for one project.', { projectRoot: '' }),
  action('missionBoardCreate', 'mission-board', 'Create a mission on a project board.', { title: '', projectRoot: '', goal: '', actor: '' }),
  action('missionBoardGet', 'mission-board', 'Read one mission.', { missionId: '' }),
  action('missionBoardClaim', 'mission-board', 'Claim a mission for yourself (self-assign).', { missionId: '', actor: '', agentLabel: '' }),
  action('missionBoardAssign', 'mission-board', 'Assign a mission to an agent.', { missionId: '', agentLabel: '', actor: '' }),
  action('missionBoardRelease', 'mission-board', 'Release a mission back to the open pool.', { missionId: '', actor: '' }),
  action('missionBoardContext', 'mission-board', 'Load the full resume bundle — pick up exactly where the last agent left off.', { missionId: '' }),
  action('missionBoardProgress', 'mission-board', 'Record mission progress.', { missionId: '', percent: 0, summary: '', actor: '' }),
  action('missionBoardNote', 'mission-board', 'Add a note to a mission.', { missionId: '', text: '', actor: '' }),
  action('missionBoardCheckpointAdd', 'mission-board', 'Add a checkpoint to a mission.', { missionId: '', plainEnglish: '', actor: '' }),
  action('missionBoardCheckpointComplete', 'mission-board', 'Mark a checkpoint complete.', { missionId: '', checkpointId: '', actor: '' }),
  action('missionMarketplaceList', 'mission-board', 'Browse open missions across every project.', {}),
  action('missionCapsuleCreate', 'mission-board', 'Snapshot a full handoff capsule.', { missionId: '', label: '', actor: '' }),
  action('missionCapsuleLoad', 'mission-board', 'Load a handoff capsule and continue from it.', { capsuleId: '' }),
  action('missionTemplateList', 'mission-board', 'List mission templates.', {}),
  action('missionTemplateInstantiate', 'mission-board', 'Create a mission from a template (translate a sefer, repair a game, audit a corpus).', { templateId: '', params: {}, projectRoot: '', actor: '' }),
  action('missionSwarmSplit', 'mission-board', 'Split one mission into parallel shards.', { missionId: '', shards: [], actor: '' }),
  action('missionSwarmMerge', 'mission-board', 'Merge swarm shards back into the parent.', { missionId: '', actor: '' }),
  action('missionScheduleCreate', 'mission-board', 'Create a recurring scheduled mission.', { name: '', templateId: '', every: '1d', projectRoot: '', actor: '' }),
  action('missionScheduleList', 'mission-board', 'List scheduled missions.', {}),
  action('missionScheduleTick', 'mission-board', 'Fire due scheduled missions (context carries over).', {}),
  action('missionPause', 'mission-board', 'Pause a mission for days — zero context loss.', { missionId: '', actor: '' }),
  action('missionResume', 'mission-board', 'Resume a paused mission from its capsule.', { missionId: '', actor: '' }),
  action('missionComplete', 'mission-board', 'Complete a mission (fires chained follow-ups).', { missionId: '', summary: '', actor: '' }),
  action('missionFail', 'mission-board', 'Fail a mission with an autopsy so it is never repeated.', { missionId: '', whatWentWrong: '', lesson: '', actor: '' }),
  action('missionChainAdd', 'mission-board', 'Chain follow-ups to fire when a mission completes.', { missionId: '', followups: [], actor: '' }),
  action('missionMessageSend', 'mission-board', 'Send an agent-to-agent message on a mission.', { missionId: '', text: '', to: '', actor: '' }),
  action('missionMessageInbox', 'mission-board', 'Read your mission inbox.', { missionId: '', actor: '' }),
  action('missionAutopsyLessons', 'mission-board', 'Search past failure autopsies.', { query: '' }),
  action('missionVoiceDictate', 'mission-board', 'Turn a dictated idea into a tracked mission instantly.', { transcript: '', actor: '' }),
  action('missionFederationExport', 'mission-board', 'Export a mission as a signed cross-tunnel envelope.', { missionId: '', actor: '' }),
  action('missionFederationImport', 'mission-board', 'Import a cross-tunnel mission envelope.', { envelope: {}, actor: '' }),
  action('missionDashboardSnapshot', 'mission-board', 'Live mission board state as JSON.', {}),
  action('missionDashboardPage', 'mission-board', 'Render the live mission dashboard page.', {})
]);

export function actionCatalog() { return ACTIONS.map(item => ({ ...item, template: { ...item.template } })); }
export function findAction(name) { return actionCatalog().find(item => item.action === name) || null; }
export function actionNames() { return ACTIONS.map(item => item.action); }
export function commandRunTemplate(command = '', cwd = '.') { return { action: 'commandRun', requestAction: 'commandRun', actualAction: 'commandRun', command, cwd, responseMode: 'compact' }; }
function action(name, group, summary, template = {}) { return { action: name, group, summary, template: { action: name, ...template } }; }
