// B"H
/** Browser-side gameplay sampler: real rAF deltas, input, memory, and long-task attribution. */
export function gameplaySamplerExpression(durationMs=30000){
  const duration=Math.max(5000,Number(durationMs)||30000);
  return `new Promise(resolve=>{
    const start=performance.now(), end=start+${duration}, deltas=[], actions={}, memory=[], longTasks=[];
    let last=performance.now(), worstInputGap=0, lastAction=start, observer=null;
    try{observer=new PerformanceObserver(list=>list.getEntries().forEach(e=>longTasks.push({name:e.name,entryType:e.entryType,startTime:e.startTime,duration:e.duration,at:e.startTime-start})));observer.observe({entryTypes:['longtask']});}catch{}
    const canvas=document.querySelector('canvas'); canvas?.focus?.();
    const count=n=>{actions[n]=(actions[n]||0)+1;};
    const dispatch=(t,e)=>{try{t?.dispatchEvent?.(e);}catch{}};
    const keyName=c=>({KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyQ:'q',KeyE:'e',Space:' ',KeyF:'f',Enter:'Enter',Digit1:'1',Digit2:'2',Digit3:'3'}[c]||c);
    function key(code,type='keydown'){const e=new KeyboardEvent(type,{bubbles:true,cancelable:true,code,key:keyName(code)});dispatch(window,e);dispatch(document,e);dispatch(canvas,e);count(type+':'+code);}
    function tap(code){key(code,'keydown');setTimeout(()=>key(code,'keyup'),70);}
    function click(){const r=canvas?.getBoundingClientRect?.()||{left:100,top:100,width:600,height:400};const x=r.left+r.width*(.38+Math.random()*.24),y=r.top+r.height*(.38+Math.random()*.24);for(const type of ['mousemove','pointerdown','mousedown','pointerup','mouseup','click']){const e=new MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,buttons:type.includes('down')?1:0});dispatch(canvas,e);dispatch(document,e);}count('combatClick');}
    function sweep(){const r=canvas?.getBoundingClientRect?.()||{left:100,top:100,width:600,height:400};dispatch(canvas,new MouseEvent('mousemove',{bubbles:true,cancelable:true,clientX:r.left+r.width*Math.random(),clientY:r.top+r.height*Math.random()}));count('mouseSweep');}
    const seq=[()=>key('KeyW','keydown'),()=>sweep(),()=>click(),()=>tap('Space'),()=>tap('KeyE'),()=>tap('KeyQ'),()=>tap('Digit1'),()=>tap('Digit2'),()=>tap('KeyF'),()=>tap('Enter'),()=>key('KeyA','keydown'),()=>key('KeyA','keyup'),()=>key('KeyD','keydown'),()=>key('KeyD','keyup'),()=>key('KeyW','keyup'),()=>click()];
    let i=0;
    const actionTimer=setInterval(()=>{const now=performance.now();worstInputGap=Math.max(worstInputGap,now-lastAction);lastAction=now;seq[i++%seq.length]();},220);
    const memoryTimer=setInterval(()=>{const m=performance.memory;if(m)memory.push({at:performance.now()-start,used:m.usedJSHeapSize,total:m.totalJSHeapSize});},5000);
    function percentile(sorted,p){return sorted[Math.min(sorted.length-1,Math.max(0,Math.floor(sorted.length*p)))]||0;}
    function finish(){clearInterval(actionTimer);clearInterval(memoryTimer);try{observer?.disconnect?.();}catch{}for(const c of ['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE'])key(c,'keyup');const sorted=deltas.slice().sort((a,b)=>a-b),sum=deltas.reduce((a,b)=>a+b,0),avg=sum/Math.max(1,deltas.length);const fpsValues=deltas.map(v=>1000/Math.max(.001,v)).sort((a,b)=>a-b);const memStart=memory[0]?.used||0,memEnd=memory[memory.length-1]?.used||memStart;const perf=window.__AWTSMOOS_PERFORMANCE_MODE__||null;const pixelGovernor=window.__AWTSMOOS_PIXEL_RATIO_GOVERNOR__||perf?.workerPixelRatioState||null;const guardian=window.__AWTSMOOS_FPS_GUARDIAN__||null;const budget=window.__MITZVAH_WORLD_PERFORMANCE_BUDGET__||null;resolve({durationMs:performance.now()-start,frameCount:deltas.length,avgFrameMs:avg,fps:1000/avg,onePercentLowFps:percentile(fpsValues,.01),pointOnePercentLowFps:percentile(fpsValues,.001),p95FrameMs:percentile(sorted,.95),p99FrameMs:percentile(sorted,.99),p999FrameMs:percentile(sorted,.999),worstFrameMs:sorted[sorted.length-1]||0,droppedFrames:deltas.filter(v=>v>34).length,longFrames:deltas.filter(v=>v>50).length,worstInputGap,actions,memorySamples:memory.length,memoryGrowthBytes:memEnd-memStart,longTaskCount:longTasks.length,longTasks:longTasks.slice(-20),canvases:document.querySelectorAll('canvas').length,errors:Number(window.__AWTSMOOS_ERROR_COUNT__||0),lastError:window.__AWTSMOOS_LAST_ERROR__||null,perf,pixelGovernor,guardian:{stage:guardian?.stage,avgFps:guardian?.avgFps,minFps:guardian?.minFps,stable60:guardian?.stable60,history:guardian?.history},budget,emerald:Boolean(window.__AWTSMOOS_OLAM__?.emeraldInfinityConsequence||window.olam?.emeraldInfinityConsequence),dialogueLikeNodes:document.querySelectorAll('[class*=dialog],[id*=dialog],[class*=npc],[id*=npc],[class*=talk],[id*=talk]').length,url:location.href,classes:document.documentElement.className});}
    function frame(now){deltas.push(now-last);last=now;if(now>=end)finish();else requestAnimationFrame(frame);}
    requestAnimationFrame(frame);
  })`;
}
