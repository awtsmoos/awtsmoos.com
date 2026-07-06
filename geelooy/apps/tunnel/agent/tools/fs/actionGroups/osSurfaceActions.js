// B"H
const Device = require('../deviceStateRoot.js');
const ActionStream = require('../../../lib/runtime/action-stream.js');

const SURFACES = {
  'awtsmoos://health': { title: 'Runtime Health', actions: ['tunnelLivenessTimeline', 'runtimeSnapshot', 'tunnelHealthScore'] },
  'awtsmoos://workers': { title: 'Workers', actions: ['asyncTaskStatus', 'commandStatus', 'runtimeSnapshot'] },
  'awtsmoos://jobs': { title: 'Jobs', actions: ['commandStatus', 'commandWait', 'commandJobOutputPage'] },
  'awtsmoos://rooms': { title: 'Mission Rooms', actions: ['missionRoomStatus', 'missionRoomLiveStatus', 'missionRoomDiscovery'] },
  'awtsmoos://missions': { title: 'Missions', actions: ['missionStatus', 'missionReport', 'missionProjectDiscover'] },
  'awtsmoos://receipts': { title: 'Receipts', actions: ['actionHistoryList', 'missionLedgerStatus'] },
  'awtsmoos://journals': { title: 'Journals', actions: ['missionRoomJournal', 'missionRoomReplay'] },
  'awtsmoos://actions': { title: 'Action History', actions: ['actionHistoryList', 'actionHistorySearch', 'actionHistoryGet'] },
  'awtsmoos://streams': { title: 'Action Streams', actions: ['actionStream', 'roomActionStream', 'agentActionStream', 'workerActionStream'] },
  'awtsmoos://browser': { title: 'Browser', actions: ['chromeTargets', 'chromeStatus', 'chromeDoctor'] },
  'awtsmoos://chrome': { title: 'Chrome', actions: ['chromeTargets', 'chromeNewPage', 'chromeClosePage', 'chromeNavigate'] },
  'awtsmoos://filesystem': { title: 'Filesystem', actions: ['treeStart', 'treePage', 'rgStart', 'rgPage', 'read', 'write'] },
  'awtsmoos://runtime': { title: 'Runtime', actions: ['runtimeSnapshot', 'actionSchemaTrace', 'agentSelfTest'] },
  'awtsmoos://trust': { title: 'Trust', actions: ['actionHistoryExplain', 'missionCourt', 'missionVerify'] },
  'awtsmoos://cost': { title: 'Cost', actions: ['queueStats', 'runtimeSnapshot'] },
  'awtsmoos://resources': { title: 'Resources', actions: ['runtimeSnapshot', 'treeSummary', 'rgSummary'] },
  'awtsmoos://logs': { title: 'Logs', actions: ['chromeLogs', 'actionStream', 'commandJobOutputPage'] },
  'awtsmoos://diagnostics': { title: 'Diagnostics', actions: ['tunnelDoctor', 'chromeDoctor', 'nodeVersionDoctor'] },
  'awtsmoos://schemas': { title: 'Schemas', actions: ['actionSchemaTrace', 'awtsmoosCapabilities'] },
  'awtsmoos://capabilities': { title: 'Capabilities', actions: ['awtsmoosCapabilities'] }
};

function buildOsSurfaceActions(ctx = {}) {
  const { config, payload } = ctx;
  return {
    awtsmoosOsBrowse: () => browse(config, payload),
    awtsmoosRuntimeBrowse: () => browse(config, payload),
    awtsmoosCapabilities: () => capabilities(config)
  };
}

function browse(config = {}, payload = {}) {
  const uri = normalizeUri(payload.uri || payload.path || payload.url || 'awtsmoos://');
  if (uri === 'awtsmoos://') return { ok: true, action: payload.action || 'awtsmoosOsBrowse', uri, surfaces: Object.entries(SURFACES).map(([href, item]) => ({ href, ...item })) };
  const surface = SURFACES[uri];
  if (!surface) return { ok: false, action: payload.action || 'awtsmoosOsBrowse', uri, error: 'unknown_awtsmoos_surface', available: Object.keys(SURFACES) };
  return {
    ok: true,
    action: payload.action || 'awtsmoosOsBrowse',
    uri,
    surface,
    state: Device.report(config),
    streamPath: ActionStream.streamPath(config),
    localApi: {
      health: '/health',
      actions: '/actions',
      tools: '/tools',
      schemas: '/schemas',
      fs: '/fs',
      command: '/command',
      chrome: '/chrome'
    }
  };
}

function capabilities(config = {}) {
  return {
    ok: true,
    action: 'awtsmoosCapabilities',
    surfaces: Object.keys(SURFACES),
    features: {
      correlationScope: true,
      actionStream: true,
      cursorResume: true,
      commandWorkers: true,
      scanWorkers: true,
      chromeTargetLeases: true,
      nodeDomRuntime: true,
      missionRooms: true,
      localApi: true,
      deviceStateOutsideProject: Device.report(config).outsideProject
    }
  };
}

function normalizeUri(value) {
  const text = String(value || 'awtsmoos://').trim();
  if (text === 'awtsmoos:' || text === 'awtsmoos://') return 'awtsmoos://';
  if (text.startsWith('awtsmoos://')) return text.replace(/\/+$/, '');
  return 'awtsmoos://' + text.replace(/^\/+|\/+$/g, '');
}

module.exports = { buildOsSurfaceActions, browse, capabilities, SURFACES };
