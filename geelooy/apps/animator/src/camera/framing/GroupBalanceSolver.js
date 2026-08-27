// B"H
export class GroupBalanceSolver{static x(targets=[]){return targets.length?targets.reduce((s,t)=>s+Number(t.position?.x||0),0)/targets.length:0;}}
