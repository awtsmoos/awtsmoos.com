// B"H
function createPayload(payload, kind, extra = {}) {
  const target = payload.targetVessel || payload.tunnelName || 'native-local';
  return { kind, title:payload.title || extra.title || 'Awtsmoos Preview',
    path:payload.path || payload.p || extra.path || '.', actionId:payload.actionId || extra.actionId || '',
    tunnelName:payload.tunnelName || 'auto', targetVessel:target,
    conversationId:payload.conversationId || '', conversationName:payload.conversationName || payload.conversation || '',
    visibility:payload.visibility || 'private', ttlSeconds:payload.ttlSeconds || 3600,
    allowDownload:payload.allowDownload === true || payload.allowDownload === 'true',
    allowFolderBrowse:payload.allowFolderBrowse !== false && payload.allowFolderBrowse !== 'false',
    allowSearch:payload.allowSearch !== false && payload.allowSearch !== 'false',
    createdBy:payload.createdBy || 'ai', ai:payload.ai !== false, ...extra };
}
/** B"H — Preview payloads keep policy explicit before the web gate opens. */
module.exports = { createPayload };
