/* B"H
AudioGraph owns master/stream/record/monitor buses. It is the routing covenant
beneath recording and streaming, verified without demanding user microphones.
*/
import { createAudioBus, routeBus } from './AudioBus.js';
import { createAudioMixer, mixBuses } from './AudioMixer.js';
export function createAudioGraph(input = {}) {
  const master = createAudioBus({ id:'master', name:'Master' });
  const stream = createAudioBus({ id:'stream', name:'Stream' });
  const record = createAudioBus({ id:'record', name:'Record' });
  const monitor = createAudioBus({ id:'monitor', name:'Monitor' });
  const graph = { kind:'AudioGraph', context:input.context || null, buses:{ master, stream, record, monitor }, sources:[], mixer:createAudioMixer({ buses:[master, stream, record, monitor] }) };
  routeBus(master, stream); routeBus(master, record); routeBus(master, monitor);
  return graph;
}
export function addAudioSource(graph, source = {}) { const model = { id:source.id || `audio-${Date.now()}`, busId:source.busId || 'master', gain:Number(source.gain ?? 1), node:source.node || null }; graph.sources.push(model); return model; }
export function renderAudioMix(graph, sampleMap = {}) { return mixBuses(graph.mixer, sampleMap); }
export function getAudioBus(graph, id) { return graph.buses[id] || null; }
