// B"H
/**
 * Chapter 112: The Code tab registered as a vessel, not a frightened tab.
 */
export const CODE_BROWSER_TUNNEL_VERSION = 'awtsmoos-code-vessel-1.0.0';

export function codeBrowserTunnelTools({ fsActions = [], commandActions = [], previewActions = [] } = {}) {
  return {
    fsList: true, fsTree: true, fsRead: true, fsWrite: true, fsBulk: true,
    fsAdvanced: [...fsActions], command: 'merkava-virtual-or-remote',
    commandActions: [...commandActions], httpProxy: false,
    nodeScript: 'merkava-simulated', chrome: false, browser: true,
    browserTab: true, browserAnalysis: true, receiptStore: true,
    previewControl: [...previewActions]
  };
}

export function codeBrowserRegistrationPacket({ tunnelName, fsActions = [], commandActions = [], previewActions = [], userAgent = '', url = '' } = {}) {
  if (!tunnelName) throw new Error('code_browser_tunnel_name_required');
  return {
    type: 'TUNNEL_REGISTER', protocolVersion: 'awtsmoos-tunnel-v2',
    kind: 'browser-code-vessel', name: tunnelName, tunnelName,
    vessel: 'awtsmoos-code', vesselType: 'awtsmoos-code',
    deviceName: 'Awtsmoos Code', root: 'awtsmoos://code',
    allowWrite: true, allowSecrets: false, allowCommands: 'limited',
    agentVersion: CODE_BROWSER_TUNNEL_VERSION, browserAgent: true,
    workspaceId: 'browser-workspace', userAgent, url,
    capabilities: capabilities(fsActions, commandActions, previewActions),
    tools: codeBrowserTunnelTools({ fsActions, commandActions, previewActions }),
    chrome: { enabled: false }, command: { enabled: false, mode: 'merkava-virtual-or-remote' },
    safety: { preserveIdentity: true, missionSideChannel: true }
  };
}

function capabilities(fsActions, commandActions, previewActions) {
  return { fsRead: true, fsWrite: true, workspaceTree: true, preview: true,
    commandRun: 'merkava-virtual-or-remote', nodeScript: 'merkava-simulated',
    missionAware: true, receiptStore: true, correlationSafe: true,
    commandModes: ['merkava-virtual', 'native-delegated', 'unsupported'],
    fsActions: [...fsActions], commandActions: [...commandActions], previewControl: [...previewActions],
    chrome: false, httpProxy: false, allowSecrets: false };
}
