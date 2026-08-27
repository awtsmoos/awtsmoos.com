// B"H
// ECS components are plain arrays: many sparks, little overhead.
export function createComponents(cap = 512) {
  return {
    alive: new Uint8Array(cap), x: new Float32Array(cap), y: new Float32Array(cap),
    vx: new Float32Array(cap), vy: new Float32Array(cap), r: new Float32Array(cap),
    color: Array(cap), kind: Array(cap), entry: Array(cap), cap
  };
}
