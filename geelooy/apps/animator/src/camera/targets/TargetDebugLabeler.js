// B"H
export class TargetDebugLabeler{static label(targets=[]){return targets.map(t=>`${t.role}:${t.id}@${Math.round(t.position?.x||0)}`).join(',');}}
