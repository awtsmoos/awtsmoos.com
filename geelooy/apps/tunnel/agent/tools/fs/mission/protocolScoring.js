// B"H
function has(v){return Array.isArray(v)?v.length>0:String(v||'').trim().length>0;}
function scoreStage(stage,content='',meta={}){const words=String(content||'').trim().split(/\s+/).filter(Boolean).length;const base=Math.min(1,words/80);const score={ideasDepth:stage==='WILD_BRAINSTORM'?Math.min(1,(meta.ideaCount||0)/50):base,realism:stage==='REALITY_TRACK'?base:0.8,fileMapCompleteness:stage==='FILE_TOUCH_MAP'?Math.min(1,(meta.fileCount||0)/Math.max(1,meta.expectedFileCount||1)):0.8,executionProof:stage==='STAGE_EXECUTION'?Number(has(meta.proof)||base>0.5):0.8,novelty:Math.min(1,(meta.novelty||0.75)),riskReduction:Math.min(1,(meta.riskReduction||0.75)),artifactCompleteness:base};score.overall=Object.values(score).reduce((a,b)=>a+b,0)/7;return score;}
function pass(score,threshold=0.35){return score.overall>=threshold;}
module.exports={scoreStage,pass};
