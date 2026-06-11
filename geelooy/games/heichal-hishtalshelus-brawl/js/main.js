import { MAPS } from './data/maps.js';
import { createInput } from './controls/input.js';
import { createGameState } from './core/state.js';
import { stepState } from './core/loop.js';
import { draw } from './render/renderer.js';
/** B"H — boot gate: worker if possible, fallback if needed, all canvas. */
const canvas=document.getElementById('olam'),select=document.getElementById('mapSelect'),bots=document.getElementById('botSelect'),restart=document.getElementById('restart'),debug=document.getElementById('debugToggle');
const input=createInput(document); let worker,state,ctx;
for(const map of MAPS){const o=document.createElement('option');o.value=map.id;o.textContent=map.name;select.appendChild(o);}
const packet=()=>({w:innerWidth,h:innerHeight,dpr:Math.min(devicePixelRatio||1,2)});
function selectedMap(){return MAPS.find(m=>m.id===select.value)||MAPS[0];}
function tryWorker(){ if(!canvas.transferControlToOffscreen||!window.Worker)return false; worker=new Worker('./js/workers/simulationWorker.js',{type:'module'}); const off=canvas.transferControlToOffscreen(); worker.postMessage({type:'init',...packet(),canvas:off,mapId:select.value||MAPS[0].id,bots:+bots.value},[off]); setInterval(()=>worker.postMessage({type:'input',input:input.read()}),1000/60); return true; }
function fallback(){ ctx=canvas.getContext('2d'); recreate(); requestAnimationFrame(frame); }
function recreate(){ if(worker)worker.postMessage({type:'map',mapId:select.value,bots:+bots.value}); else state=createGameState(selectedMap(),+bots.value); }
function resize(){ const p=packet(); if(worker)worker.postMessage({type:'resize',...p}); else{canvas.width=p.w*p.dpr;canvas.height=p.h*p.dpr;ctx?.setTransform(p.dpr,0,0,p.dpr,0,0);} }
function frame(){ stepState(state,input.read()); draw(ctx,state,canvas.clientWidth,canvas.clientHeight); requestAnimationFrame(frame); }
restart.onclick=recreate; select.onchange=recreate; bots.onchange=recreate; debug.onclick=()=>{ if(worker)worker.postMessage({type:'debug'}); else state.debug=!state.debug; };
addEventListener('resize',resize); if(!tryWorker())fallback(); resize();
