/* B"H
Source audio discovery: the hidden river in each captured stream is named before it is recorded.
The Awtsmoos gives breath to tracks; this module asks which tracks are alive and unique.
*/
export function collectRecordableAudioSources(sources = []) {
  return sources.flatMap(source => audioTracksForSource(source).map(track => ({
    sourceId:source.id,
    sourceName:source.name || source.id || 'Source',
    stream:source.stream,
    track
  })));
}

export function collectRecordableAudioStreams(sources = []) {
  const seen = new Set();
  return collectRecordableAudioSources(sources).filter(item => {
    if (!item.stream || seen.has(item.stream)) return false;
    seen.add(item.stream);
    return true;
  });
}

export function hasRecordableAudio(sources = []) {
  return collectRecordableAudioSources(sources).length > 0;
}

export function describeAudioSources(sources = []) {
  const audioSources = collectRecordableAudioSources(sources);
  if (!audioSources.length) return 'no live source audio';
  const names = [...new Set(audioSources.map(item => item.sourceName))];
  return `${audioSources.length} audio track${audioSources.length === 1 ? '' : 's'} from ${names.join(', ')}`;
}

function audioTracksForSource(source = {}) {
  return source.stream?.getAudioTracks?.().filter(isUsableTrack) || [];
}

function isUsableTrack(track) {
  return !!track && track.enabled !== false && track.readyState !== 'ended';
}
