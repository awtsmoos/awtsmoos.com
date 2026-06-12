// B"H
import { bindReadingProgressState } from '../readingProgressState.js';
globalThis.innerHeight = 500;
globalThis.scrollY = 250;
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
let value = null;
globalThis.document = { documentElement: { scrollHeight: 1000 }, querySelector(){ return { style: { setProperty(name,v){ if (name === '--reader-progress') value = v; } } }; } };
bindReadingProgressState();
if (value !== '0.5') throw new Error('progress value wrong '+value);
console.log('B"H progressState.test passed');
