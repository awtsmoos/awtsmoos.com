/** B"H — state resolver from actual runtime fields. */
import { attackPhase,clamp,mag } from './Math.js';
export function poseName(f){return poseInfo(f).name;}
export function poseInfo(f){
 if(f.dead||f.ko||f.stockLost)return pack('death',f);
 if(f.respawnTimer||f.invuln>80)return pack('respawn',f);
 if(f.ledgeHang)return ledgeInfo(f);
 if(f.grabbedBy)return pack('grabHold',f);
 if(f.grab)return pack('grabStart',f);
 const a=f.attack||f.rapidAttack;if(a)return attackInfo(f,a);
 if((f.shieldBreak||0)>0)return pack('shieldBreak',f);
 if(f.blocking)return pack((f.shieldHit||0)>0?'shieldHit':'shieldIdle',f);
 if((f.stun||0)>0)return hitInfo(f);
 if(!f.grounded)return airInfo(f);
 if((f.landingLag||0)>0)return pack((f.preLandingVy||0)>13?'hardLanding':'landing',f);
 if(f.chargeGlow||(f.charge?.punch||0)>0||(f.charge?.kick||0)>0)return pack('chargePunchHold',f);
 const speed=Math.abs(f.vx||0);
 if((f.turnaround||0)>0||((f.input?.x||0)*(f.vx||0)<-.3))return pack('turnaround',f);
 if(speed>7.4)return pack('sprint',f);
 if(speed>3.1)return pack('run',f);
 if(speed>.55)return pack(Math.abs(f.input?.x||0)<.12?'brake':'walk',f);
 if(f.aiMind?.combatHeat?.forceEngage)return pack('readyStance',f);
 return pack(f.aiMind?.combatHeat?.comboMode||f.nearEnemy?'combatIdle':'idle',f);
}
function ledgeInfo(f){const i=f.input||f.lastInput||{};if(i.jump)return pack('ledgeClimb',f);if(i.down||i.y>.42||i.aimY>.42)return pack('ledgeDrop',f);if(i.punch||i.kick)return pack('ledgeAttack',f);return pack('ledgeHang',f);}
function attackInfo(f,a){const ph=attackPhase(f),id=a.id||'';if(a.rapid||f.rapidAttack)return pack('rapidPunch',f,ph);if(id.includes('grab'))return pack(ph.name==='followThrough'?'grabThrow':'grabStart',f,ph);if(id.includes('meteor'))return pack('meteorKick',f,ph);if(id.includes('aerial'))return pack('aerialKick',f,ph);if(id.includes('round')||id.includes('kick'))return pack(id.includes('round')?'roundhouse':'kick',f,ph);if(id.includes('charge')||a.fullCharge||(a.charge||0)>.35)return pack(ph.name==='anticipation'?'chargePunchStart':ph.name==='action'?'chargePunchRelease':'chargePunchHold',f,ph);if(ph.name==='followThrough'&&ph.t>.55)return pack('punchMissRecovery',f,ph);return pack(id.includes('combo')?'punchCombo':'punchJab',f,ph);}
function airInfo(f){if((f.diveAttackFrames||0)>0||(f.diving||0)>0)return pack('dive',f);if((f.jumpsUsed||0)>1&&(f.vy||0)<-5)return pack('doubleJump',f);if(f.fastFalling||(f.vy||0)>12)return pack('fastFall',f);if((f.vy||0)<-2.5)return pack((f.jumpMemory?.hold||0)<8?'jumpStart':'rising',f);if(Math.abs(f.vy||0)<=2.5)return pack('peak',f);return pack('falling',f);}
function hitInfo(f){const force=Math.max(mag(f),(f.damage||0)/28,(f.hitstop||0)/3);if(force>8||(f.stun||0)>34)return pack('hitHeavy',f);if(force>4.5||(f.stun||0)>16)return pack('hitMedium',f);return pack('hitLight',f);}
function pack(name,f,phase=null){const combo=clamp(((f.comboCount||f.rapidJail?.recentHits||0)/8)+(f.aiMind?.comboMomentum?.active?0.45:0));return{name,phase,combo,speed:mag(f),heavy:clamp(((f.damage||0)/160)+combo*.5)};}
