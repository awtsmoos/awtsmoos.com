// B"H
/**
 * @file emeraldAudioMixer.js
 * @description Chapter 505: Starts Emerald ambience as real browser audio
 * nodes, guarded so multiple world-loads do not stack layers.
 */
import { createEmeraldAudioLayer } from './emeraldAudioLayer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { emeraldAudioState, ensureAudioContext, stopEmeraldAudio } from './emeraldAudioState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function startEmeraldAmbience(audio = {}) {
  stopEmeraldAudio();
  const ctx = ensureAudioContext();
  if (!ctx) return false;
  if (ctx.state === 'suspended') ctx.resume?.();
  Object.values(audio).forEach(group => (group?.layers || []).forEach(layer => emeraldAudioState.nodes.push(...createEmeraldAudioLayer(ctx, layer, group.volume || 0.1))));
  return true;
}
