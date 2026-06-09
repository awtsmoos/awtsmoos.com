// B"H
/**
 * @file emeraldAudioMixer.js
 * @description Chapter 505: Starts Emerald ambience as real browser audio
 * nodes, guarded so multiple world-loads do not stack layers.
 */
import { createEmeraldAudioLayer } from './emeraldAudioLayer.js';
import { emeraldAudioState, ensureAudioContext, stopEmeraldAudio } from './emeraldAudioState.js';
export function startEmeraldAmbience(audio = {}) {
  stopEmeraldAudio();
  const ctx = ensureAudioContext();
  if (!ctx) return false;
  if (ctx.state === 'suspended') ctx.resume?.();
  Object.values(audio).forEach(group => (group?.layers || []).forEach(layer => emeraldAudioState.nodes.push(...createEmeraldAudioLayer(ctx, layer, group.volume || 0.1))));
  return true;
}
