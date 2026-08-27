/* B"H */
import { createProviderRegistry, getProvider } from './ProviderRegistry.js';
import { createStreamSession, startStreamSession, stopStreamSession, attachStreamSegment } from './StreamSession.js';
import { createHlsPublisher, addHlsSegment, hlsPlaylist } from './HlsPublisher.js';
export function createStreamManager(input = {}) { return { kind:'StreamManager', registry:input.registry || createProviderRegistry(), sessions:[], publisher:createHlsPublisher(input.publisher || {}) }; }
export function startManagedStream(manager, providerId = 'generic-hls') { const provider = getProvider(manager.registry, providerId); if (!provider) throw new Error(`missing_provider_${providerId}`); const session = startStreamSession(createStreamSession({ providerId })); manager.sessions.push(session); return session; }
export function publishManagedSegment(manager, session, segment) { const hls = addHlsSegment(manager.publisher, segment); attachStreamSegment(session, hls); return hls; }
export function stopManagedStream(manager, session) { session.playlist = hlsPlaylist(manager.publisher, true); return stopStreamSession(session); }
