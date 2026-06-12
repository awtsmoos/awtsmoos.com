// B"H
import { bindCurrentSectionTracker, getCurrentSectionTrackerState } from '../currentSectionTracker.js';
import { manifestProgressSpine } from '../progressSpine.js';

let disconnects = 0;
let observed = 0;
let replaced = 0;

class FakeIntersectionObserver {
  constructor() {}
  observe() { observed += 1; }
  disconnect() { disconnects += 1; }
}

globalThis.window = globalThis;
globalThis.IntersectionObserver = FakeIntersectionObserver;

const chunks = [
  { dataset: { chunkId: '0' }, classList: { toggle() {} } },
  { dataset: { chunkId: '1' }, classList: { toggle() {} } }
];
const spine = {
  dataset: {},
  replaceChildren(...children) { replaced += 1; this.children = children; },
  setAttribute() {}
};

globalThis.document = {
  body: { appendChild() {} },
  createElement() { return { className: '', dataset: {}, setAttribute() {} }; },
  querySelector(selector) { return selector === '.awtsmoos-progress-spine' ? spine : null; },
  querySelectorAll(selector) {
    if (selector === '#realPost .scroll-chunk') return chunks;
    if (selector === '#virtual-scroll-container > .scroll-chunk') return chunks;
    return [];
  }
};

bindCurrentSectionTracker();
bindCurrentSectionTracker();
if (disconnects !== 1) throw new Error('second tracker bind should disconnect previous observer');
if (getCurrentSectionTrackerState()?.count !== 2) throw new Error('tracker state did not record count');
if (observed !== 4) throw new Error('unexpected observer count');

manifestProgressSpine();
manifestProgressSpine();
if (replaced !== 1) throw new Error('progress spine rebuilt despite unchanged signature');

console.log('B"H idempotency.test passed');
