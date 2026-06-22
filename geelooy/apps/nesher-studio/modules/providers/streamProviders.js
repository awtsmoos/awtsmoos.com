/* B"H
Provider vessels: all drink from the same format river, none are declared proven.
*/
export const STREAM_FORMAT = Object.freeze({
  video: 'H.264 / AVC', audio: 'AAC-LC 48 kHz', container: 'MPEG-TS', protocol: 'HLS', playlist: 'M3U8', segments: '.ts'
});
export const STREAM_PROVIDERS = Object.freeze([
  provider('generic-hls', 'Generic HLS', 'Any endpoint accepting HLS media playlists + TS segments.'),
  provider('youtube', 'YouTube', 'Format-shaped only; real ingest still requires provider validation.'),
  provider('twitch', 'Twitch', 'Future adapter can map to Twitch ingest or relay conversion.'),
  provider('facebook', 'Facebook Live', 'Future adapter can map to Live Producer ingest requirements.'),
  provider('steam', 'Steam Broadcast', 'Future adapter; verify current Steam ingest requirements before use.'),
  provider('awtsmoos', 'Awtsmoos Relay', 'Local tunnel relay and future hosted distribution path.'),
  provider('custom', 'Custom Provider', 'User supplies playlist/segment endpoints or relay config.')
]);
export function getProvider(id) { return STREAM_PROVIDERS.find(p => p.id === id) || STREAM_PROVIDERS[0]; }
export function formatSummary() { return `${STREAM_FORMAT.video} + ${STREAM_FORMAT.audio} in ${STREAM_FORMAT.container} ${STREAM_FORMAT.protocol}`; }
function provider(id, name, note) { return { id, name, note, format:STREAM_FORMAT }; }
