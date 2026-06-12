// B"H
import { bindCurrentSectionTracker } from '../currentSectionTracker.js';
globalThis.document = { querySelectorAll(){ return []; } };
globalThis.IntersectionObserver = undefined;
const unbind = bindCurrentSectionTracker();
if (typeof unbind !== 'function') throw new Error('tracker must return cleanup');
console.log('B"H currentSectionTracker.test passed');
