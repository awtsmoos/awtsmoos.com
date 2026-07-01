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
  action('missionHandoffGenerate', 'mission', 'Generate a compact mission handoff.')
]);

export function actionCatalog() { return ACTIONS.map(item => ({ ...item, template: { ...item.template } })); }
export function findAction(name) { return actionCatalog().find(item => item.action === name) || null; }
export function actionNames() { return ACTIONS.map(item => item.action); }
export function commandRunTemplate(command = '', cwd = '.') { return { action: 'commandRun', requestAction: 'commandRun', actualAction: 'commandRun', command, cwd, responseMode: 'compact' }; }
function action(name, group, summary, template = {}) { return { action: name, group, summary, template: { action: name, ...template } }; }
