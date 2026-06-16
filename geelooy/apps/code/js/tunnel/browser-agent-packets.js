// B"H
/**
 * B"H
 * Chapter 36: The registration oath became testable outside the editor storm.
 *
 * The code-tab tunnel packet must be pure enough to stress-test without loading
 * the whole /apps/code workspace graph. This module shapes the protocol-v2
 * browser-tab registration and leaves runtime state to browser-agent.js.
 */
export const CODE_BROWSER_TUNNEL_VERSION = "browser-editor-hei-2.0.0";

export function codeBrowserTunnelTools({ fsActions = [], commandActions = [], previewActions = [] } = {}) {
  return {
    fsList: true,
    fsTree: true,
    fsRead: true,
    fsWrite: true,
    fsBulk: true,
    fsAdvanced: [...fsActions],
    command: "simulated",
    commandActions: [...commandActions],
    httpProxy: false,
    nodeScript: "browser-simulated",
    chrome: false,
    browser: true,
    browserTab: true,
    browserAnalysis: true,
    previewControl: [...previewActions]
  };
}

export function codeBrowserRegistrationPacket({ tunnelName, fsActions = [], commandActions = [], previewActions = [], userAgent = "" } = {}) {
  if (!tunnelName) throw new Error("code_browser_tunnel_name_required");
  return {
    type: "TUNNEL_REGISTER",
    protocolVersion: "awtsmoos-tunnel-v2",
    name: tunnelName,
    tunnelName,
    vesselType: "browser-tab",
    deviceName: "Awtsmoos Code Browser Tab",
    root: "browser://apps/code/workspaces",
    allowWrite: true,
    allowSecrets: false,
    allowCommands: false,
    agentVersion: CODE_BROWSER_TUNNEL_VERSION,
    browserAgent: true,
    userAgent,
    capabilities: {
      browserTab: true,
      fs: true,
      fsRead: true,
      fsWrite: true,
      browserWorkspaces: true,
      commandRun: "simulated",
      nodeScript: "browser-simulated",
      chrome: false,
      httpProxy: false,
      browserAnalysis: true,
      fsActions: [...fsActions],
      previewControl: [...previewActions]
    },
    tools: codeBrowserTunnelTools({ fsActions, commandActions, previewActions }),
    chrome: { enabled: false },
    command: { enabled: false, mode: "simulated" }
  };
}
