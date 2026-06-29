// B"H
/** SimulationRuntime: village brain, crowd LOD, deterministic replay. */
export function crowdPlan(crowd=[], budget={}){ const hz=budget.ai?.farHz||1; return { groups:Math.max(1,Math.ceil(crowd.length/8)), hz, mode:budget.level==='rescue'?'coarse':'expressive' }; }
export function backgroundLod(distance=0, budget={}){ if(distance<25)return 'full'; if(distance<80)return budget.level==='rescue'?'sleep':'aware'; return 'summary'; }
export function deterministicReplay(events=[], seed=1){ return events.map((event,index)=>({ ...event, replayTick:index, deterministicSeed:seed+index })); }
export function villageBrain(systems=[], budget={}){ return systems.map((id,index)=>({ id, priority:(systems.length-index)*(budget.level==='rescue'?0.5:1) })).sort((a,b)=>b.priority-a.priority); }
export function moralDilemma(id='limited_bread'){ return { id, choices:['feed_family','feed_traveler','split_portions'], certainty:false }; }
export default { crowdPlan, backgroundLod, deterministicReplay, villageBrain, moralDilemma };
