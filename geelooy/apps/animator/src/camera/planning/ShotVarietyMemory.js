// B"H
export class ShotVarietyMemory{static remember(state,plan){const h=state?.get?.('_shotHistory')||[];state?.set?.('_shotHistory',[...h.slice(-8),{shotType:plan.shotType,angle:plan.angle}],true);}}
