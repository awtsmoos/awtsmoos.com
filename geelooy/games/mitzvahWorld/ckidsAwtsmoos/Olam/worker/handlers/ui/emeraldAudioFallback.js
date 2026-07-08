// B"H
/**
 * @file emeraldAudioFallback.js
 * @description Chapter 506: Handles Emerald ambience UI events with a real
 * WebAudio mixer.
 */
import { startEmeraldAmbience } from './emeraldAudio/emeraldAudioMixer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function handleEmeraldAudioFallback(shaym, ob = {}) {
  if (shaym !== 'emeraldAmbientAudio') return false;
  startEmeraldAmbience(ob.audio || ob.entryScene?.audio || {});
  return true;
}
