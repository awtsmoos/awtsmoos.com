// B"H
export class ShotDecisionTrace{static make(plan={}){return{shotType:plan.shotType,targets:plan.targets?.map(t=>t.id)||[],reason:plan.reason,debug:plan.debug};}}
