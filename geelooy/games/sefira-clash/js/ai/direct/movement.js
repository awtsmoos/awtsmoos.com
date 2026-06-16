/** B"H — chase, recover, and anti-pacing movement. */
export function movementX(bot,state,dx,offstage,brain){if(offstage)return bot.x<state.map.w/2?1:-1;const edge=edgeWarning(bot);if(edge)return edge;if(Math.abs(dx)<42)return brain.noPressure>90?-Math.sign(dx||bot.face||1)*.35:0;return Math.sign(dx);}
export function recover(out,bot,state){out.x=bot.x<state.map.w/2?1:-1;out.jump=true;out.special=true;out.aimX=out.x;out.aimY=-1;out.tactic='RecoverBurst';return out;}
export function shouldJump(bot,dy,adx,brain){if(!bot.grounded)return false;if(dy<-52&&adx<300)return true;if(brain.noPressure>150&&brain.clock%75<8)return true;if(brain.clock%180===0&&adx>160)return true;return false;}
function edgeWarning(bot){const p=bot.currentPlatform;if(!p)return 0;if(bot.x<p.x+46)return 1;if(bot.x>p.x+p.w-46)return-1;return 0;}
