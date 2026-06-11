import { keyboard } from './keyboard.js';
import { touchJoystick } from './touchJoystick.js';
import { touchButtons } from './touchButtons.js';
/** B"H — merges desktop and mobile into one input soul. */
export function createInput(doc){ const touch={x:0,jump:false,punch:false,kick:false,grab:false,shield:false,special:false}; const readKeys=keyboard(doc); touchJoystick(doc,touch); touchButtons(doc,touch); return {read(){const k=readKeys(); return {x:touch.x||k.x,jump:touch.jump||k.jump,punch:touch.punch||k.punch,kick:touch.kick||k.kick,grab:touch.grab||k.grab,shield:touch.shield||k.shield,special:touch.special||k.special};}}; }
