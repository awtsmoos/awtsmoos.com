/* B"H
WebM blob: the final garment is named with codecs but sourced from manual chunks.
*/
import { targetBuffer } from './webmTarget.js';
export function finalizeWebmBlob(target, codecs = 'vp8') { return new Blob([targetBuffer(target)], { type:`video/webm;codecs=${codecs}` }); }
