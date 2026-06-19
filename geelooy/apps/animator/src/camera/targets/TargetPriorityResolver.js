// B"H
export class TargetPriorityResolver{static assign(targets=[],event={}){return targets.map(t=>({...t,priority:t.id===event.primaryTarget?9:t.role==='speaker'?7:t.role==='object'?6:t.role==='listener'?5:t.priority||1})).sort((a,b)=>b.priority-a.priority);}}
