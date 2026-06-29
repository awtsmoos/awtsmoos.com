/* B"H
Manual WebM muxer factory: public API unchanged, inner vessels split.
Today Malchus still uses the stable webm-muxer bridge; the bridge is isolated for Mediabunny replacement.
*/
import { finalizeWebmBlob } from './container/webmBlob.js';
import { codecString } from './container/webmCodecString.js';
import { createLegacyWebmMuxer } from './container/legacyWebmMuxer.js';
export async function createWebmMuxer(options = {}) { return createLegacyWebmMuxer(options); }
export function finalizeWebmTarget(target, codecs = 'vp8') { return finalizeWebmBlob(target, codecs); }
export { codecString };
