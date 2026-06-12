// B"H
import { bindCardDepthObserver } from '../cardDepthObserver.js';
globalThis.innerHeight = 1000;
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
let toggled = false;
const card = { getBoundingClientRect(){ return { top: 100, height: 100 }; }, classList: { toggle(name,on){ if (name === 'is-card-current' && on) toggled = true; } } };
globalThis.document = { querySelectorAll(){ return [card]; } };
bindCardDepthObserver(document);
if (!toggled) throw new Error('card did not receive current class');
console.log('B"H cardDepthObserver.test passed');
