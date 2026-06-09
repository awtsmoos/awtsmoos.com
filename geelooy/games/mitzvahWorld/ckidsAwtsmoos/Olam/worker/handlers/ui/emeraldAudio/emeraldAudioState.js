// B"H
/**
 * @file emeraldAudioState.js
 * @description Chapter 503: A tiny ambience mixer state. The browser receives
 * real WebAudio layers even before final recorded assets exist.
 */
export const emeraldAudioState = { context: null, nodes: [] };
export function ensureAudioContext() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!emeraldAudioState.context) emeraldAudioState.context = new AudioCtor();
  return emeraldAudioState.context;
}
export function stopEmeraldAudio() {
  emeraldAudioState.nodes.forEach(node => { try { node.stop?.(); } catch {} try { node.disconnect?.(); } catch {} });
  emeraldAudioState.nodes = [];
}
