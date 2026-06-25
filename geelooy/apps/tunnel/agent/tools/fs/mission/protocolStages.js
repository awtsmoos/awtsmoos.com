// B"H
const STAGES = [
  ['WILD_BRAINSTORM', '01_wild_50_ideas.md'],
  ['REALITY_TRACK', '02_realistic_track.md'],
  ['FILE_TOUCH_MAP', '03_file_touch_map.md'],
  ['STAGE_PLAN', '04_stage_plan.md'],
  ['STAGE_EXECUTION', '05_execution_log.md'],
  ['STAGE_REVIEW', '06_done_vs_planned.md'],
  ['GAP_ANALYSIS', '07_remaining_debt.md'],
  ['NEXT_GATE', '08_next_gate.md']
];
function names(){return STAGES.map(x=>x[0]);}
function artifactName(stage){return (STAGES.find(x=>x[0]===stage)||[])[1]||'stage.md';}
function index(stage){return Math.max(0,names().indexOf(stage));}
function next(stage){return names()[index(stage)+1]||'WILD_BRAINSTORM';}
function first(){return names()[0];}
function completeCycleStages(stages={}){return names().every(name=>stages[name]?.complete===true);}
function requiredArtifacts(){return STAGES.map(([stage,file])=>({stage,file}));}
function prerequisites(stage){const i=index(stage);return names().slice(0,i);}
function canRun(cycle,stage){return prerequisites(stage).every(name=>cycle.stages?.[name]?.complete);}
module.exports={STAGES,names,artifactName,index,next,first,completeCycleStages,requiredArtifacts,prerequisites,canRun};
