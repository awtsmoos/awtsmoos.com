// B"H
import { accessorFloatArray } from './tiny-gltf-accessors.js';
import { lerpArray, quatSlerp } from './tiny-math.js';
import { resetTreeToBase } from './tiny-runtime.js';

/** Animation: clips do not snap; they bow through a crossfade bridge. */
const TARGET_SIZE = { translation: 3, rotation: 4, scale: 3, weights: 1 };
const ID = () => { let n = 0; return (o) => (o.__awtsAnimId ||= ++n); };
const objectId = ID();

export function summarizeAnimations(doc) { return (doc.animations || []).map((a, index) => ({ index, name: a.name || `animation_${index}`, channels: (a.channels || []).length, samplers: (a.samplers || []).length, paths: [...new Set((a.channels || []).map((c) => c.target?.path).filter(Boolean))] })); }

export function parseTinyAnimations(doc, accessors, nodeMap) {
  return (doc.animations || []).map((anim, index) => {
    const channels = []; let duration = 0;
    for (const ch of anim.channels || []) {
      const sampler = anim.samplers?.[ch.sampler], target = ch.target || {}, node = nodeMap.get(target.node);
      if (!sampler || !node || !TARGET_SIZE[target.path]) continue;
      const input = accessorFloatArray(accessors[sampler.input]), output = accessorFloatArray(accessors[sampler.output]), size = TARGET_SIZE[target.path];
      duration = Math.max(duration, input[input.length - 1] || 0); channels.push({ node, nodeIndex: target.node, path: target.path, input, output, size, interpolation: sampler.interpolation || 'LINEAR' });
    }
    return { index, name: anim.name || `animation_${index}`, duration, channels };
  });
}

export class TinyAnimationPlayer {
  constructor(root, clips = []) { Object.assign(this, { root, clips, currentIndex: 0, time: 0, playing: true, bindPose: false, lastApplied: 'bind', fadeDuration: 0.18, fadeTime: 0, fadePose: null }); }
  get current() { return this.clips[this.currentIndex] || null; }
  get names() { return this.clips.map((c) => c.name); }
  play(indexOrName) {
    const i = typeof indexOrName === 'number' ? indexOrName : this.clips.findIndex((c) => c.name === indexOrName);
    if (i < 0) return this.current; if (i === this.currentIndex && !this.bindPose) return this.current;
    this.fadePose = this.snapshot(this.clips[i]); this.fadeTime = 0; this.currentIndex = i; this.time = 0; this.bindPose = false; this.apply(0); return this.current;
  }
  next() { return this.play((this.currentIndex + 1) % Math.max(1, this.clips.length)); }
  setBindPose(on) { this.bindPose = !!on; this.time = 0; this.fadePose = null; resetTreeToBase(this.root); this.lastApplied = this.bindPose ? 'bind' : 'reset'; }
  update(dt) { if (this.bindPose || !this.current) { resetTreeToBase(this.root); return; } if (this.playing) this.time += dt; if (this.fadePose) this.fadeTime += dt; const d = this.current.duration || 1; this.apply(d ? this.time % d : 0); }
  apply(t) { resetTreeToBase(this.root); const clip = this.current; if (!clip) return; for (const ch of clip.channels) setTarget(ch.node, ch.path, this.blended(ch, sample(ch, t))); if (this.fadePose && this.fadeTime >= this.fadeDuration) this.fadePose = null; this.lastApplied = clip.name; }
  blended(ch, value) { const from = this.fadePose?.get(keyOf(ch)); if (!from) return value; const f = smooth(Math.min(1, this.fadeTime / Math.max(0.001, this.fadeDuration))); return ch.path === 'rotation' ? quatSlerp(from, value, f) : lerpArray(from, value, f); }
  snapshot(clip) { const map = new Map(); for (const ch of clip?.channels || []) map.set(keyOf(ch), readTarget(ch.node, ch.path)); return map; }
  diagnostics() { const c = this.current; return { playing: this.playing, bindPose: this.bindPose, currentAnimation: c?.name || null, currentIndex: this.currentIndex, clipCount: this.clips.length, fade: this.fadePose ? Number((1 - this.fadeTime / this.fadeDuration).toFixed(3)) : 0, time: Number(this.time.toFixed(3)), duration: Number((c?.duration || 0).toFixed(3)), channels: c?.channels.length || 0 }; }
}

function keyOf(ch) { return `${objectId(ch.node)}:${ch.path}`; }
function smooth(f) { return f * f * (3 - 2 * f); }
function readTarget(n, p) { return p === 'translation' ? n.position.toArray() : p === 'rotation' ? n.quaternion.toArray() : n.scale.toArray(); }
function setTarget(node, path, value) { if (path === 'translation') node.position.fromArray(value); else if (path === 'rotation') node.quaternion.fromArray(value); else if (path === 'scale') node.scale.fromArray(value); }
function sliceValue(arr, index, size) { const out = []; for (let i = 0; i < size; i++) out[i] = arr[index * size + i] ?? (size === 4 && i === 3 ? 1 : 0); return out; }
function span(times, t) { if (t <= times[0]) return [0, 0, 0]; const last = times.length - 1; if (t >= times[last]) return [last, last, 0]; let lo = 0, hi = last; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (times[mid] <= t) lo = mid; else hi = mid; } return [lo, hi, (t - times[lo]) / Math.max(1e-8, times[hi] - times[lo])]; }
function sample(channel, t) { const [a, b, f] = span(channel.input, t), step = channel.interpolation === 'STEP' || a === b; const va = sliceValue(channel.output, a, channel.size), vb = sliceValue(channel.output, b, channel.size); return step ? va : channel.path === 'rotation' ? quatSlerp(va, vb, f) : lerpArray(va, vb, f); }
