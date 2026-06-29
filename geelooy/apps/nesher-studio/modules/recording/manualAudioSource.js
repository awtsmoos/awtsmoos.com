/* B"H
Manual audio source: a single external window keeps its own living track.
Only many rivers are mixed; one river goes straight to WebCodecs AudioEncoder.
*/
import { createSourceAudioMix } from './audioMix.js';
import { collectRecordableAudioStreams, describeAudioSources } from './sourceAudio.js';

export async function createManualAudioSource(sources = [], options = {}) {
  const streams = collectRecordableAudioStreams(sources);
  if (!streams.length) return inactiveSource('no live source audio');
  if (streams.length === 1) return directSource(streams[0], sources, options);
  return mixedSource(sources, options);
}

function directSource(item, sources, options) {
  const original = item.stream.getAudioTracks()[0];
  const track = original.clone ? original.clone() : original;
  const settings = track.getSettings?.() || original.getSettings?.() || {};
  return {
    active:true,
    mode:'direct',
    track,
    sampleRate:settings.sampleRate || options.sampleRate || 48000,
    numberOfChannels:settings.channelCount || options.numberOfChannels || 2,
    sourceCount:1,
    summary:describeAudioSources(sources),
    stop:async () => { if (track !== original) track.stop?.(); }
  };
}

async function mixedSource(sources, options) {
  const mix = await createSourceAudioMix(sources, options);
  if (!mix.active) return inactiveSource(mix.reason || 'audio mix unavailable');
  return {
    active:true,
    mode:'mixed',
    track:mix.stream.getAudioTracks()[0],
    sampleRate:mix.sampleRate,
    numberOfChannels:mix.numberOfChannels,
    sourceCount:mix.sourceCount,
    summary:describeAudioSources(sources),
    stop:() => mix.stop()
  };
}

function inactiveSource(reason) {
  return { active:false, mode:'none', reason, sourceCount:0, stop:async () => {} };
}
