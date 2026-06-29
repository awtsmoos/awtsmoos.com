/* B"H
Audio mix: many captured rivers become one track only when direct passage is impossible.
No speaker is awakened here; the breath is routed only into a destination track.
*/
import { collectRecordableAudioStreams } from './sourceAudio.js';

export async function createSourceAudioMix(sources = [], options = {}) {
  const items = collectRecordableAudioStreams(sources);
  if (!items.length) return inactiveMix('no live source audio');
  const AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioContextCtor) return inactiveMix('AudioContext unavailable');
  const sampleRate = options.sampleRate || 48000;
  const ctx = new AudioContextCtor({ sampleRate });
  const destination = ctx.createMediaStreamDestination();
  const nodes = [];
  for (const item of items) connectStream(ctx, destination, item.stream, nodes);
  await ctx.resume?.();
  return {
    active:true,
    stream:destination.stream,
    sampleRate:ctx.sampleRate || sampleRate,
    numberOfChannels:options.numberOfChannels || 2,
    sourceCount:items.length,
    stop:async () => {
      nodes.forEach(node => safeDisconnect(node));
      destination.disconnect?.();
      await ctx.close?.();
    }
  };
}

function connectStream(ctx, destination, stream, nodes) {
  const sourceNode = ctx.createMediaStreamSource(stream);
  const gain = ctx.createGain();
  gain.gain.value = 1;
  sourceNode.connect(gain).connect(destination);
  nodes.push(sourceNode, gain);
}

function inactiveMix(reason) {
  return { active:false, reason, sourceCount:0, stop:async () => {} };
}

function safeDisconnect(node) {
  try { node.disconnect?.(); } catch {}
}
