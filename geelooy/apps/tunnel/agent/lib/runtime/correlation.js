// B"H
function fields(payload = {}) { return { tunnelName: payload.tunnelName || '', requestedTunnelName: payload.requestedTunnelName || '', controlRequestId: payload.controlRequestId || '', clientRequestId: payload.clientRequestId || '', agentSessionId: payload.agentSessionId || '', logicalAgentId: payload.logicalAgentId || '', projectRoot: payload.projectRoot || payload.root || '', nonce: payload.nonce || '' }; }
module.exports = { fields };
