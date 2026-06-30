/* B"H
 * Local WebM muxer: real encoded chunks receive local EBML garments.
 * The Nesher sorts encoded sparks by WebCodecs microsecond timestamps into millisecond clusters.
 */
import { chunkBytes, concat, exactBuffer } from './bytes.js';
import { clusterElement, infoElement, segmentHeader, simpleBlock, tracksElement, webmHeader } from './webmElements.js';

const CLUSTER_MS = 5000;

export async function createLocalWebmMuxer(options = {}) {
  const target = createLocalTarget();
  return { muxer:new LocalWebmMuxer(normalizeOptions(options), target), target, engine:'local-webm' };
}
export function createLocalTarget() { return { kind:'local-webm-target', buffer:new ArrayBuffer(0), finalized:false }; }

class LocalWebmMuxer {
  constructor(options, target) { this.options = options; this.target = target; this.blocks = []; }
  addVideoChunk(chunk, meta) { this.addBlock({ track:1, chunk, meta, key:isVideoKey(chunk, meta) }); }
  addAudioChunk(chunk, meta) { this.addBlock({ track:2, chunk, meta, key:true }); }
  addBlock({ track, chunk, meta, key }) {
    const timestamp = timestampMs(chunk, meta), payload = chunkBytes(chunk);
    if (payload.length) this.blocks.push({ track, timestamp, key, payload });
  }
  finalize() {
    const blocks = this.normalizedBlocks(), duration = durationMs(blocks, this.options.fps);
    const body = [infoElement(duration), tracksElement(this.options), ...clusters(blocks)];
    this.target.buffer = exactBuffer(concat([webmHeader(), segmentHeader(), ...body]));
    this.target.finalized = true;
  }
  normalizedBlocks() {
    const first = Math.min(...this.blocks.map(b => b.timestamp), 0);
    return this.blocks.map(b => ({ ...b, timestamp:Math.max(0, b.timestamp - first) })).sort(blockOrder);
  }
}

function normalizeOptions(options) {
  return { fps:30, width:1, height:1, video:{ muxCodec:'V_VP8' }, ...options };
}
function clusters(blocks) {
  const groups = new Map();
  for (const block of blocks) {
    const base = Math.floor(block.timestamp / CLUSTER_MS) * CLUSTER_MS;
    (groups.get(base) || groups.set(base, []).get(base)).push(block);
  }
  return [...groups.entries()].map(([base, list]) => clusterElement(base, list.map(block => blockElement(base, block))));
}
function blockElement(base, block) {
  return simpleBlock({ track:block.track, relative:block.timestamp - base, key:block.key, payload:block.payload });
}
function durationMs(blocks, fps = 30) {
  const last = blocks.at(-1)?.timestamp || 0;
  return Math.max(1, last + Math.round(1000 / Math.max(1, fps)));
}
function timestampMs(chunk, meta) {
  const value = chunk?.timestamp ?? meta?.timestamp ?? 0;
  return Math.round(Number(value || 0) / 1000);
}
function blockOrder(a, b) { return a.timestamp - b.timestamp || a.track - b.track; }
function isVideoKey(chunk, meta) { return chunk?.type === 'key' || meta?.type === 'key' || !!meta?.decoderConfig; }
