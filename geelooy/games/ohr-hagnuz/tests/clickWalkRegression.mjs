//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file clickWalkRegression.mjs
 * @description Proves lifecycle-aware boot, click travel, collision refusal, arrival, and keyboard override.
 * The Awtsmoos renews road and traveler while each test vessel keeps one truth in view;
 * Awtsmoos.com awaits the real boot covenant, then follows pointer and keyboard pathways through.
 */
import { createTestBrowser, enterFreeOverworld } from './TestOverworldFixture.mjs';

const evidence = [];
const { listeners, canvases } = createTestBrowser();

/** Throws one readable regression failure when a finite condition is not revealed. */
function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

await import('../src/index.js');
await globalThis.__OHR_HAGNUZ_BOOT_PROMISE__;

const { State } = await import('../src/binah/State.js');
const { Logic } = await import('../src/yesod/Logic.js');
const { Projector } = await import('../src/tiferet/Projector.js');
const { setPathTo } = await import('../src/yesod/OhrWorld.js');
const pointer = listeners.get('layer-obj:pointerdown');
const keyboardDown = listeners.get('window:keydown');

assert(globalThis.__OHR_HAGNUZ_IGNITED__ === true, 'Solo boot did not ignite');
assert(typeof pointer === 'function', 'pointer listener missing');
assert(typeof keyboardDown === 'function', 'keyboard listener missing');
assert(Projector.camera({ w: 1024, h: 768 }).w === 1024, 'camera ignores canvas width');
evidence.push('awaitable boot, listeners, and canvas-sized camera verified');

enterFreeOverworld(State);
State.resetHero(12, 7);
pointer({
	clientX: 464,
	clientY: 300,
	button: 0,
	isPrimary: true,
	pointerId: 7,
	preventDefault() {}
});
assert(State.HeroPath.length === 1, 'click did not create one-step path');
assert(canvases.get('layer-obj').captured === 7, 'pointer capture did not run');

for (let step = 0; step < 24; step += 1) {
	Logic.process();
}

assert(State.Hero.cx === 13 && State.Hero.cy === 7, 'hero did not arrive at clicked tile');
assert(State.HeroPath.length === 0 && State.PathTarget === null, 'arrival did not clear path state');
evidence.push('click path reaches destination and clears target');

State.resetHero(12, 7);
assert(setPathTo(12, 7)?.length === 0 && State.PathTarget === null, 'same-tile click was not a clean no-op');
assert(setPathTo(-99, -99) === null && State.PathTarget?.valid === false, 'blocked target was not marked invalid');
evidence.push('same-tile and blocked targets remain safe');

State.resetHero(12, 7);
setPathTo(13, 7);
keyboardDown({ key: 'ArrowUp', preventDefault() {} });
assert(State.HeroPath.length === 0 && State.PathTarget === null, 'manual key did not cancel path');
evidence.push('bound keyboard override cancels click-walk');

console.log(JSON.stringify({ ok: true, evidence }, null, 2));
