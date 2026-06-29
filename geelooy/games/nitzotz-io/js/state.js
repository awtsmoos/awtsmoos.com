// B'H
import { createLevel, WORLDS } from './level.js';
import { loadSave } from './save.js';
export const SEFIROT=[['Malchus','Begin'],['Chesed','Wider pull'],['Gevurah','Tougher vessels'],['Tiferes','Combo harmony'],['Netzach','Speed surge'],['Chochmah','Radar'],['Keser','World gate']];
export function createWorld(){const save=loadSave(),wi=save.completed.length%WORLDS.length,level=createLevel(save,wi);return{mode:'ready',save,level,player:{x:0,y:0,z:0,r:24,h:38,speed:275,glow:0,combo:1,comboT:0},camera:{x:0,y:-360,z:260,angle:0,distance:460,shake:0,victory:0},input:{x:0,y:0,pulse:0},particles:[],absorbers:[],floaters:[],events:[],score:0,timeLeft:level.time,won:false,lost:false,sefirah:0,message:'B"H · Begin '+level.name+'. Best '+save.best+'.'}}
export function addBurst(w,o){let max=w.save.perf==='low'?8:w.save.perf==='high'?22:15;for(let i=0;i<max;i++)w.particles.push({x:o.x,y:o.y,z:o.z+o.h*.5,vx:(Math.random()-.5)*230,vy:(Math.random()-.5)*230,vz:90+Math.random()*180,life:.75+Math.random()*.8,r:3+Math.random()*6,hue:o.hue})}
export function addText(w,x,y,z,text){w.floaters.push({x,y,z,text,life:1.1})}
