/* B"H
Legacy WebM muxer bridge: still stable, still manual, now isolated for future Mediabunny swap.
*/
import { WEBM_MUXER_URL } from './webmMuxerUrl.js';
import { muxerConfig } from './webmTrackConfig.js';
import { createArrayBufferTarget } from './webmTarget.js';
export async function loadLegacyWebmMuxer() { return import(WEBM_MUXER_URL); }
export async function createLegacyWebmMuxer(options) { const module = await loadLegacyWebmMuxer(); const target = await createArrayBufferTarget(module); return { muxer:new module.Muxer(muxerConfig({ ...options, target })), target, engine:'webm-muxer' }; }
