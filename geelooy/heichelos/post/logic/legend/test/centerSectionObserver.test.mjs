// B"H
import { bindCenterSectionObserver } from '../centerSectionObserver.js';
globalThis.innerHeight = 1000;
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
let toggled = false;
const chunk = { getBoundingClientRect(){ return { top: 300, height: 100 }; }, classList: { toggle(name,on){ if (name === 'is-reader-center' && on) toggled = true; } } };
globalThis.document = { querySelectorAll(){ return [chunk]; } };
bindCenterSectionObserver();
if (!toggled) throw new Error('center section class missing');
console.log('B"H centerSectionObserver.test passed');
