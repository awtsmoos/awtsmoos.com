import { MAPS } from '../data/maps.js';
import { createGameState } from '../core/state.js';
import { stepState } from '../core/loop.js';
import { draw } from '../render/renderer.js';
let canvas,ctx,state,input={},size={w:800,h:600,dpr:1},bots=5;
self.onmessage=e=>{const m=e.data;if(m.type==='init'){canvas=m.canvas;ctx=canvas.getContext('2d');bots=m.bots||5;resize(m);create(m.mapId);frame();} if(m.type==='input')input=m.input; if(m.type==='resize')resize(m); if(m.type==='map'){bots=m.bots||bots;create(m.mapId);} if(m.type==='debug'&&state)state.debug=!state.debug;};
function resize(m){size={w:m.w||size.w,h:m.h||size.h,dpr:m.dpr||size.dpr}; if(canvas){canvas.width=size.w*size.dpr;canvas.height=size.h*size.dpr;ctx.setTransform(size.dpr,0,0,size.dpr,0,0);}}
function create(id){state=createGameState(MAPS.find(x=>x.id===id)||MAPS[0],bots);}
function frame(){ if(state&&ctx){stepState(state,input);draw(ctx,state,size.w,size.h);} setTimeout(frame,1000/60); }
