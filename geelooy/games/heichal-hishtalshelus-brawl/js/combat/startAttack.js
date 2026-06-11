import { ATTACKS } from '../data/attacks.js';
/** B"H — turns input into timed combat flame. */
export function maybeStartAttack(f,input){ if(f.attack||f.stun>0||f.blocking)return; const id=input.special?'special':input.grab?'grab':input.kick?'kick':input.punch?'punch':''; if(id)f.attack={...ATTACKS[id],hasHit:new Set()}; }
