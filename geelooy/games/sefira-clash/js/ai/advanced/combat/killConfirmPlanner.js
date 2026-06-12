/**
 * B"H
 * Kill confirm planner.
 *
 * Chapter 45: when the percent climbs, mercy changes shape. The bot chooses
 * launchers, traps, edges, and charged violence according to actual kill state.
 */
export function killConfirmTactic(bot, world, fallback) {
  if (!shouldKill(world)) return fallback;
  const c = world.combat;
  const edge = world.edgePressure;
  if (world.landingTrap?.active) return tactic('KillLandingTrap','kick',world.landingTrap.aimX,-0.15,true,'kick');
  if (c.shouldAntiAir) return tactic('KillAntiAir','punch',Math.sign(world.target.x-bot.x||bot.face||1),-1,true,'antiAir');
  if (edge?.active && edge.score>0.25) return tactic('EdgeFinishKick','kick',edge.attackToward,0,false,'chargeKick');
  if (c.reachableClose && world.target.damage>120) return tactic('KillChargeKick','kick',c.facing,-0.05,false,'chargeKick');
  if (c.reachableClose) return tactic('KillLauncher','kick',c.facing,-0.2,true,'kick');
  if (c.canHitNow) return tactic('KillPoke','kick',c.facing,0,true,'kick');
  return fallback;
}
export function shouldKill(world){return !!(world.combatHeat?.killMode||world.target.damage>=86||world.koPressure?.lethal||world.koIntent?.killReady);}
function tactic(kind,button,aimX,aimY,instant,family){return{kind,button,aimX:Math.sign(aimX||1),aimY,instant,family};}
