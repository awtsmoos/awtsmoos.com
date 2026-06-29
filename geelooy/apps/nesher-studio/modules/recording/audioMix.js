/* B"H
Audio mix: many captured rivers become one stream for the WebM vessel.
No speaker is awakened here; the breath is routed only into a destination track.
*/
import { collectRecordableAudioSources } from './sourceAudio.js';

export async function createSourceAudioMix(sources = [], options = {}) {
  const items = collectRecordableAudioSources(sources);
  if (!items.length) return inactiveMix('no live source audio');
  const AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioContextCtor) return inactiveMix('AudioContext unavailable');
  const sampleRate = options.sampleRate || 48000;
  const ctx = new AudioContextCtor({ sampleRate });
  const destination = ctx.createMediaStreamDestination();
  const nodes = [];
  for (const item of uniqueStreams(items)) connectStream(ctx, destination, item, nodes);
  await ctx.resume?.();
  return {
    active:true,
    stream:destination.stream,
    sampleRate:ctx.sampleRate || sampleRate,
    numberOfChannels:options.numberOfChannels || 2,
    sourceCount:nodes.length,
    stop:async () => {
      nodes.forEach(node => safeDisconnect(node));
      destination.disconnect?.();
      await ctx.close?.();
    }
  };
}

function connectStream(ctx, destination, item, nodes) {
  const sourceNode = ctx.createMediaStreamSource(item.stream);
  const gain = ctx.createGain();
  gain.gain.value = 1;
  sourceNode.connect(gain).connect(destination);
  nodes.push(sourceNode, gain);
}

function uniqueStreams(items) {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.stream)) return false;
    seen.add(item.stream);
    return true;
  });
}

function inactiveMix(reason) {
  return { active:false, reason, sourceCount:0, stop:async () => {} };
}

function safeDisconnect(node) {
  try { node.disconnect?.(); } catch {}
}
