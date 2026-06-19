// B"H
/** Browser-side gameplay sampler: real rAF deltas while controls are hammered. */
export function gameplaySamplerExpression(durationMs = 30000) {
  const duration = Math.max(5000, Number(durationMs) || 30000);
  return `new Promise(resolve => {
    const start = performance.now();
    const end = start + ${duration};
    const deltas = [];
    const actions = {};
    let last = performance.now();
    const canvas = document.querySelector('canvas');
    canvas?.focus?.();
    function count(name){ actions[name]=(actions[name]||0)+1; }
    function dispatch(target, event){ try { target?.dispatchEvent?.(event); } catch {} }
    function keyName(code){ return { KeyW:'w', KeyA:'a', KeyS:'s', KeyD:'d', KeyQ:'q', KeyE:'e', Space:' ', KeyF:'f', Enter:'Enter', Digit1:'1', Digit2:'2', Digit3:'3' }[code] || code; }
    function key(code, type='keydown') {
      const event = new KeyboardEvent(type, { bubbles:true, cancelable:true, code, key:keyName(code) });
      dispatch(window,event); dispatch(document,event); dispatch(canvas,event);
      count(type + ':' + code);
    }
    function tap(code){ key(code,'keydown'); setTimeout(()=>key(code,'keyup'),80); }
    function click() {
      const r = canvas?.getBoundingClientRect?.() || { left:100, top:100, width:600, height:400 };
      const x = r.left + r.width * (0.35 + Math.random()*0.3), y = r.top + r.height * (0.35 + Math.random()*0.3);
      for (const type of ['mousemove','pointerdown','mousedown','pointerup','mouseup','click']) {
        const e = new MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,buttons:type.includes('down')?1:0});
        dispatch(canvas,e); dispatch(document,e);
      }
      count('combatClick');
    }
    function sweep() {
      const r = canvas?.getBoundingClientRect?.() || { left:100, top:100, width:600, height:400 };
      dispatch(canvas,new MouseEvent('mousemove',{bubbles:true,cancelable:true,clientX:r.left+r.width*Math.random(),clientY:r.top+r.height*Math.random()}));
      count('mouseSweep');
    }
    const sequence = [
      () => key('KeyW','keydown'), () => sweep(), () => click(), () => tap('Space'), () => tap('KeyE'),
      () => tap('KeyQ'), () => tap('Digit1'), () => tap('Digit2'), () => tap('KeyF'), () => tap('Enter'),
      () => key('KeyA','keydown'), () => key('KeyA','keyup'), () => key('KeyD','keydown'), () => key('KeyD','keyup'),
      () => key('KeyW','keyup'), () => click()
    ];
    let actionIndex = 0;
    const actionTimer = setInterval(() => { sequence[actionIndex % sequence.length](); actionIndex += 1; }, 180);
    function finish() {
      clearInterval(actionTimer);
      for (const code of ['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE']) key(code,'keyup');
      const sorted = deltas.slice().sort((a,b)=>a-b);
      const sum = deltas.reduce((a,b)=>a+b,0);
      const avg = sum / Math.max(1,deltas.length);
      const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
      const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
      const worst = sorted[sorted.length-1] || 0;
      const longFrames = deltas.filter(v=>v>50).length;
      const droppedFrames = deltas.filter(v=>v>34).length;
      const perf = window.__AWTSMOOS_PERFORMANCE_MODE__ || null;
      const pixelGovernor = window.__AWTSMOOS_PIXEL_RATIO_GOVERNOR__ || perf?.workerPixelRatioState || null;
      resolve({ durationMs: performance.now() - start, frameCount: deltas.length, avgFrameMs: avg, fps: 1000 / avg, p95FrameMs: p95, p99FrameMs: p99, worstFrameMs: worst, droppedFrames, longFrames, actions, canvases: document.querySelectorAll('canvas').length, errors: Number(window.__AWTSMOOS_ERROR_COUNT__ || 0), lastError: window.__AWTSMOOS_LAST_ERROR__ || null, perf, pixelGovernor, dialogueLikeNodes: document.querySelectorAll('[class*=dialog],[id*=dialog],[class*=npc],[id*=npc],[class*=talk],[id*=talk]').length, url: location.href, classes: document.documentElement.className });
    }
    function frame(now) {
      deltas.push(now - last);
      last = now;
      if (now >= end) finish(); else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })`;
}
