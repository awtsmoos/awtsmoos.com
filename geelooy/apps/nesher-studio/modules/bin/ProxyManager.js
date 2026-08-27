/* B"H */
export function createProxyManager(input = {}) { return { kind:'ProxyManager', presets:input.presets || [{ id:'preview-540p', width:960, height:540, bitrate:1200000 }], jobs:input.jobs || [] }; }
export function createProxyDescriptor(asset, preset = {}) { return { id:`proxy-${asset.id}-${preset.id || 'preview'}`, assetId:asset.id, presetId:preset.id || 'preview', uri:null, status:'queued', width:preset.width || 960, height:preset.height || 540, bitrate:preset.bitrate || 1200000 }; }
export function queueProxy(manager, asset, presetId = 'preview-540p') { const preset = manager.presets.find(p => p.id === presetId) || manager.presets[0]; const proxy = createProxyDescriptor(asset, preset); manager.jobs.push(proxy); asset.proxies ||= []; asset.proxies.push(proxy); return proxy; }
export function markProxyReady(proxy, uri) { proxy.status = 'ready'; proxy.uri = uri; return proxy; }
