// B"H
import { bindScrollHeroState } from '../scrollHeroState.js';
let classes = new Set();
globalThis.window = { scrollY: 200, addEventListener(){}, removeEventListener(){} };
globalThis.document = { querySelector(){ return { dataset:{}, classList:{ toggle(name,on){ if(on) classes.add(name); else classes.delete(name); } } }; } };
bindScrollHeroState(document);
if (!classes.has('hero-compact')) throw new Error('hero compact class missing');
console.log('B"H scrollHeroState.test passed');
