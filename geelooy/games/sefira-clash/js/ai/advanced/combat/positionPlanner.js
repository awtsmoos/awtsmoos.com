import { personalSpace } from './personalSpace.js';
/** B"H - Landing traps and platform desire positioning. */
export function combatPocket(bot, world) {
 const c=world.combat, threat=world.threat||{}, pred=world.predatorGoal, space=personalSpace(bot,world);
 if(world.landingTrap?.active) return pocket('LandingTrap',world.landingTrap.x,world.landingTrap.aimX,world.landingTrap.aimY);
 if(world.platformDesire&&takePlatform(bot,world)) return pocket('Platform',world.platformDesire.x,Math.sign(world.target.x-bot.x||1),0);
 if(threat.panic) return pocket('Panic',bot.x+threat.escapeSide*220,threat.flankSide,0);
 if(pred&&pred.distance>22) return pocket(pred.kind,pred.x,pred.aimX,pred.aimY||0);
 if(c.shouldAntiAir) return pocket('AntiAir',world.prediction?.x??world.target.x,0,-1);
 if(c.canHitNow) return pocket('ThreatHold',space.standX,c.facing,0);
 return pocket('Approach',pred?.x??space.standX,pred?.aimX??c.facing,0);
}
function takePlatform(bot,world){const d=world.platformDesire; return d&&(d.reason==='landingTrap'||(d.score>150&&Math.abs(d.x-bot.x)>220));}
function pocket(kind,standX,aimX,aimY){return{kind,standX,aimX:Math.sign(aimX||1),aimY};}
