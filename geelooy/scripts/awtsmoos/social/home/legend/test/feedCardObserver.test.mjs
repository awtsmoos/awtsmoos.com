// B"H
import { bindFeedCardObserver } from '../feedCardObserver.js';
globalThis.innerHeight = 1000;
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
let toggled = false;
const card = { getBoundingClientRect(){ return { top: 450, height: 100 }; }, classList: { toggle(name,on){ if (name === 'is-feed-current' && on) toggled = true; } } };
globalThis.document = { querySelectorAll(){ return [card]; } };
bindFeedCardObserver(document);
if (!toggled) throw new Error('feed current class missing');
console.log('B"H feedCardObserver.test passed');
