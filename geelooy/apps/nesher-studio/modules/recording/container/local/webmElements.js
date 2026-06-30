/* B"H
 * WebM element builders: header, info, tracks, clusters, and blocks.
 * Duration is measured in TimestampScale units; OpusHead receives little-endian truth.
 */
import { ascii, concat, u8, uintBE, uintLE } from './bytes.js';
import { element, floatElement, master, stringElement, uintElement, unknownSize8 } from './ebml.js';

export const IDS = {
  EBML:[0x1a,0x45,0xdf,0xa3], SEG:[0x18,0x53,0x80,0x67], INFO:[0x15,0x49,0xa9,0x66],
  TRACKS:[0x16,0x54,0xae,0x6b], TRACK:[0xae], CLUSTER:[0x1f,0x43,0xb6,0x75], TIMECODE:[0xe7], BLOCK:[0xa3]
};

export function webmHeader() {
  return master(IDS.EBML, [
    uintElement([0x42,0x86], 1), uintElement([0x42,0xf7], 1), uintElement([0x42,0xf2], 4),
    uintElement([0x42,0xf3], 8), stringElement([0x42,0x82], 'webm'),
    uintElement([0x42,0x87], 4), uintElement([0x42,0x85], 2)
  ]);
}

export function segmentHeader() { return concat([u8(...IDS.SEG), unknownSize8()]); }
export function infoElement(durationMs = 0, app = 'Nesher Local WebM') {
  return master(IDS.INFO, [
    uintElement([0x2a,0xd7,0xb1], 1000000, 3), duration(durationMs),
    stringElement([0x4d,0x80], app), stringElement([0x57,0x41], app)
  ].filter(Boolean));
}

export function tracksElement({ width, height, video, audio }) {
  const tracks = [videoTrack({ width, height, codec:video?.muxCodec })];
  if (audio?.active) tracks.push(audioTrack(audio));
  return master(IDS.TRACKS, tracks);
}

export function clusterElement(timecode, blocks) {
  return master(IDS.CLUSTER, [uintElement(IDS.TIMECODE, timecode), ...blocks]);
}

export function simpleBlock({ track, relative, key, payload }) {
  if (relative < -32768 || relative > 32767) throw new Error(`SimpleBlock relative timecode out of range: ${relative}`);
  return element(IDS.BLOCK, concat([trackVint(track), int16(relative), u8(key ? 0x80 : 0), payload]));
}

function duration(ms) { return ms > 0 ? floatElement([0x44,0x89], ms) : null; }
function videoTrack({ width, height, codec }) {
  return master(IDS.TRACK, [
    uintElement([0xd7], 1), uintElement([0x73,0xc5], 1), uintElement([0x83], 1),
    stringElement([0x86], codec || 'V_VP8'), master([0xe0], [uintElement([0xb0], width), uintElement([0xba], height)])
  ]);
}
function audioTrack(audio) {
  return master(IDS.TRACK, [
    uintElement([0xd7], 2), uintElement([0x73,0xc5], 2), uintElement([0x83], 2), stringElement([0x86], 'A_OPUS'),
    element([0x63,0xa2], opusHead(audio)), master([0xe1], [floatElement([0xb5], audio.sampleRate || 48000), uintElement([0x9f], audio.numberOfChannels || 2)])
  ]);
}
function opusHead(audio) {
  return concat([ascii('OpusHead'), u8(1, audio.numberOfChannels || 2), uintLE(312, 2), uintLE(audio.sampleRate || 48000, 4), uintLE(0, 2), u8(0)]);
}
function trackVint(track) { if (track < 1 || track > 126) throw new Error(`Unsupported local WebM track number: ${track}`); return u8(0x80 | track); }
function int16(value) { const out = new Uint8Array(2); new DataView(out.buffer).setInt16(0, value, false); return out; }
