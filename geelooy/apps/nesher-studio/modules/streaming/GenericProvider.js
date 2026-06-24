/* B"H */
export function createGenericProvider(input = {}) { return provider('generic-hls', 'Generic HLS', input); }
export function provider(id, label, input = {}) { return { id:input.id || id, kind:'StreamProvider', label:input.label || label, protocol:input.protocol || 'hls', supportsRealIngest:!!input.supportsRealIngest, endpoint:input.endpoint || null, headers:input.headers || {}, verified:false }; }
export function validateProviderConfig(p) { return { ok:!!p.protocol && (p.protocol !== 'hls' || true), warnings:p.supportsRealIngest ? [] : ['provider_not_real_ingest_verified'] }; }
