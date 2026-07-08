// B"H
/**
 * WorldQualityDirector: publishes cheap global budgets without scene traversal.
 * It watches frame breath and lets systems cheapen representation, not reality.
 */
import { collectWorldRuntimeMetrics } from './WorldRuntimeMetrics.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { classifyPerformanceBudget, mergeRuntimeBudget } from './WorldPerformanceBudget.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
const avg=xs=>xs.reduce((a,b)=>a+b,0)/Math.max(1,xs.length);
const pct=(xs,p)=>{const s=[...xs].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(s.length*p))]||0;};
export function createWorldQualityDirector(scope=globalThis,options={}){
  const frameMs=[];const maxFrames=options.maxFrames||150;const state={running:false,budget:null,metrics:null,samples:0,lastPublish:0,longFrames:0,seal:'cheap-quality-director-20260623-bh5'};
  function publish(extra={}){const mean=avg(frameMs),p95=pct(frameMs,.95),p99=pct(frameMs,.99),fps=1000/Math.max(.001,mean||16.67);const metrics=collectWorldRuntimeMetrics(scope);const input={fps,p95FrameMs:p95,p99FrameMs:p99,longFrames:frameMs.filter(v=>v>34).length,drawCalls:metrics.renderer?.render?.calls||0,triangles:metrics.scene.triangles,visibleMeshes:metrics.scene.visibleMeshes,memory:metrics.memory,...extra};const budget=mergeRuntimeBudget(state.budget,classifyPerformanceBudget(input));state.budget={...budget,cheapMetrics:true,lastFrame:{fps,p95FrameMs:p95,p99FrameMs:p99},seal:state.seal};state.metrics=metrics;state.samples+=1;state.lastPublish=Date.now();scope.__MITZVAH_WORLD_RUNTIME_METRICS__=metrics;scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__=state.budget;scope.dispatchEvent?.(new CustomEvent('mitzvah-world:performance-budget',{detail:{budget:state.budget,metrics}}));return{budget:state.budget,metrics};}
  function frame(now){if(!state.running)return;const prev=state._last||now;state._last=now;const dt=now-prev;if(dt>0&&dt<250)frameMs.push(dt);while(frameMs.length>maxFrames)frameMs.shift();if(dt>34)state.longFrames+=1;const every=options.publishEveryMs||2500;const spikeBackoff=state.longFrames>3?every*2:every;if(!state._lastNowPublish||now-state._lastNowPublish>spikeBackoff){state._lastNowPublish=now;publish({longFrameBackoff:state.longFrames});state.longFrames=0;}scope.requestAnimationFrame?.(frame);}
  function start(){if(state.running)return state;state.running=true;scope.requestAnimationFrame?.(frame);return state;}
  function stop(){state.running=false;return state;}
  return{state,start,stop,publish,frameMs};
}
export default createWorldQualityDirector;