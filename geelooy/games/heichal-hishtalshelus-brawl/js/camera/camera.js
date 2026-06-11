/** B"H — camera gathers all fighters into one compassionate frame. */
export function updateCamera(state,w,h){ const alive=state.fighters.filter(f=>!f.dead); const cx=alive.reduce((s,f)=>s+f.x,0)/Math.max(1,alive.length); const cy=alive.reduce((s,f)=>s+f.y,0)/Math.max(1,alive.length); state.camera={x:w/2-cx,y:h/2-cy-70,zoom:1}; }
