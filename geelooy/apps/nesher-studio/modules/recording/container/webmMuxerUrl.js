/* B"H
Legacy WebM muxer URL: one vessel, so future Mediabunny replacement is one gate away.
*/
export const WEBM_MUXER_URL = 'https://esm.sh/webm-muxer@5.1.2?bundle';
export function webmMuxerVersionHint() { return WEBM_MUXER_URL.match(/webm-muxer@([^?]+)/)?.[1] || 'unknown'; }
