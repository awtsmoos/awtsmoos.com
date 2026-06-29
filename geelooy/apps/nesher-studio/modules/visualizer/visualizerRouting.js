/* B"H
Visualizer routing: a layer may hear all audio, the selected source, or one named source.
*/
export function visualizerTargets(state, visualizer) {
  const sources = (state.sources || []).filter(source => source.id !== visualizer.id && hasAudio(source));
  if (visualizer.settings?.inputMode === 'selected') return sources.filter(source => source.id === state.selectedId);
  if (visualizer.settings?.inputMode === 'source') return sources.filter(source => source.id === visualizer.settings.sourceId);
  return sources;
}
export function visualizerInputOptions(state, visualizer) {
  return [{ value:'all', label:'All audio sources' }, { value:'selected', label:'Selected audio source' }, ...audioOptions(state, visualizer)];
}
export function applyInputValue(settings, value) {
  if (value === 'selected') return Object.assign(settings, { inputMode:'selected', sourceId:'' });
  if (value?.startsWith('source:')) return Object.assign(settings, { inputMode:'source', sourceId:value.slice(7) });
  return Object.assign(settings, { inputMode:'all', sourceId:'' });
}
export function inputValue(settings = {}) { return settings.inputMode === 'source' ? `source:${settings.sourceId}` : settings.inputMode || 'all'; }
export function hasAudio(source) { return !!source.stream?.getAudioTracks?.().length || ['audioFile','audioInput','displayAudio'].includes(source.type) || source.audioOnly; }
function audioOptions(state, visualizer) { return (state.sources || []).filter(s => s.id !== visualizer?.id && hasAudio(s)).map(s => ({ value:`source:${s.id}`, label:s.name || s.id })); }
