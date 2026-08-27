/* B"H
Manual WebM muxer factory: the default path now forges local EBML bytes.
The legacy network bridge remains isolated, but recording no longer depends on it.
*/
import { finalizeWebmBlob } from './container/webmBlob.js';
import { codecString } from './container/webmCodecString.js';
import { createLocalWebmMuxer } from './container/local/localWebmMuxer.js';

export async function createWebmMuxer(options = {}) { return createLocalWebmMuxer(options); }
export function finalizeWebmTarget(target, codecs = 'vp8') { return finalizeWebmBlob(target, codecs); }
export { codecString };
