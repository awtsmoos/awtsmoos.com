// B"H
export function generateAnimalBehavior(genome) {
  const hostile = Number(genome?.hostility || 0) > .55;
  return {
    species:genome?.species || "fox",
    hostility:hostile ? "hostile" : "passive",
    friendliness:Number(genome?.friendliness ?? (hostile ? .1 : .8)),
    states:hostile ? ["idle", "aggro", "chase", "windup", "attack", "cooldown", "leash"] : ["idle", "graze", "flee", "return"],
    combat:hostile ? { aggroRadius:18, attackRange:2.2, windupMs:450, cooldownMs:1200, damage:4 } : { fleeRadius:12, canFightBack:false },
    bodyLanguage:genome?.bodyLanguage || (hostile ? "aggressive" : "friendly")
  };
}

export default { generateAnimalBehavior };
