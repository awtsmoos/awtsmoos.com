/**
 * B"H
 * @file clickWalkRegression.mjs
 * @description Deterministic click-walk regression for the Ohr HaGnuz browser runtime.
 * The Awtsmoos has no body or form; this test only builds silent canvas vessels, then
 * proves the finite code receives clicks, walks, refuses blocks, and yields to keys.
 */
const listeners = new Map();
const gradient = { addColorStop() {} };
const log = [];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const makeCtx = () => new Proxy({
  canvas: { width: 800, height: 600 },
  imageSmoothingEnabled: true,
  createRadialGradient() { return gradient; },
  createLinearGradient() { return gradient; },
  measureText(text) { return { width: String(text).length * 8 }; }
}, {
  get(target, prop) { if (prop in target) return target[prop]; return () => undefined; },
  set(target, prop, value) { target[prop] = value; return true; }
});

const makeCanvas = id => ({
  id,
  width: 800,
  height: 600,
  captured: null,
  getBoundingClientRect: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
  addEventListener: (type, fn) => listeners.set(`${id}:${type}`, fn),
  setPointerCapture(pointerId) { this.captured = pointerId; },
  getContext: () => makeCtx()
});

const canvases = new Map(['layer-bg', 'layer-obj', 'layer-over'].map(id => [id, makeCanvas(id)]));
globalThis.performance = { now: () => 1000 };
globalThis.requestAnimationFrame = () => 0;
globalThis.window = {
  AwtsmoosIntents: { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 },
  addEventListener(type, fn) { listeners.set(`window:${type}`, fn); },
  __OHR_HAGNUZ_IGNITED__: false
};
globalThis.document = {
  readyState: 'complete',
  getElementById: id => canvases.get(id) || null,
  addEventListener() {},
  body: {}
};

await import('../src/index.js');
const { State } = await import('../src/binah/State.js');
const { Logic } = await import('../src/yesod/Logic.js');
const { Input } = await import('../src/yesod/Input.js');
const { Projector } = await import('../src/tiferet/Projector.js');
const { setPathTo } = await import('../src/yesod/OhrWorld.js');

const pointer = listeners.get('layer-obj:pointerdown');
assert(window.__OHR_HAGNUZ_IGNITED__ === true, 'boot did not ignite');
assert(typeof pointer === 'function', 'pointer listener missing');
assert(Projector.camera({ w: 1024, h: 768 }).w === 1024, 'camera ignores canvas width');
log.push('boot, listener, and canvas-sized camera verified');

State.resetHero(12, 7);
pointer({ clientX: 464, clientY: 300, button: 0, isPrimary: true, pointerId: 7, preventDefault() { this.prevented = true; } });
assert(State.HeroPath.length === 1, 'click did not create one-step path');
assert(canvases.get('layer-obj').captured === 7, 'pointer capture did not run');
for (let i = 0; i < 10; i += 1) Logic.process();
assert(State.Hero.cx === 13 && State.Hero.cy === 7, 'hero did not arrive at clicked tile');
assert(State.HeroPath.length === 0, 'path was not consumed after arrival');
assert(State.PathTarget === null, 'path target was not cleared after arrival');
log.push('click path reaches destination and clears target');

State.resetHero(12, 7);
const same = setPathTo(12, 7);
assert(Array.isArray(same) && same.length === 0, 'same-tile click did not return empty path');
assert(State.PathTarget === null, 'same-tile click left a target marker');
log.push('same-tile click is a clean no-op');

const blocked = setPathTo(-99, -99);
assert(blocked === null, 'blocked target unexpectedly produced a path');
assert(State.PathTarget?.valid === false, 'blocked target not marked invalid');
log.push('blocked target is marked invalid');

State.resetHero(12, 7);
setPathTo(13, 7);
Input.keyDown({ key: 'ArrowUp', preventDefault() {} }, { ArrowUp: 'U' });
assert(State.HeroPath.length === 0 && State.PathTarget === null, 'manual key did not cancel path');
log.push('manual keyboard override cancels click-walk');

console.log(JSON.stringify({ ok: true, log }, null, 2));
