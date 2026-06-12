// B"H
import { updateProgressSpine } from '../progressSpine.js';
let toggled = false;
globalThis.document = { querySelectorAll(){ return [{ dataset:{ chunkId:'1' }, classList:{ toggle(name,on){ if(name==='current' && on) toggled = true; } } }]; } };
updateProgressSpine({ dataset:{ chunkId:'1' } });
if (!toggled) throw new Error('progress marker did not update');
console.log('B"H progressSpine.test passed');
