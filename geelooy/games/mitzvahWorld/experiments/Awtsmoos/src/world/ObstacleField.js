// B"H
import { tallDoorwayWallDef } from './DoorwaySpecs.js';
import { createHouseDefs } from './House3D.js';

/** Static world definitions; measured houses receive the shared phase-one sampler. */
export function createObstacleField(assets={},groundSampler){
  const defs=[
    box('long-rotated-wall','#4b3b34',0,1,-6,9,2,.8,.42),box('thin-angle-wall','#6d5c55',-4.2,.8,1.3,.8,1.6,4.8,-.74),
    diamond('diamond-stone','#6b7484',-2.2,.95,-2.4,1.9,.25),box('small-climb-block','#a77845',2.2,.34,-1.8,1.25,.42,1.25,-.35,{},true),
    doorway('literal-boolean-doorway-wall','#5e4439',0,1.5,-13,8.5,3,.75,.08,{x:2.35,y:2.18}),tallDoorwayWallDef(),
    ...createHouseDefs(assets,groundSampler),...stairs('climb-staircase-a',-3.6,6.4,-.5),...stairs('climb-staircase-b',6.6,6.1,.72),
    platform('floating-step-one','#8e764d',-6,.65,-9.2,2.4,.42,2.4,.35),platform('floating-step-two','#9e885b',-8.8,1.06,-11.4,2.2,.42,2.2,-.52),
    platform('gentle-ramp-walk-test','#7c6442',4.8,.52,-8.6,5,.34,1.7,-.7,{x:.25}),platform('steep-burger-slide-hill','#b8864f',-10.5,.86,4.4,5.4,.42,3.3,.28,{x:.86}),
    ceiling('hat-clearance-overhang','#3d3630',1.8,2.8,13.6,4.8,.34,3,.18),ceiling('low-bounce-ceiling','#514740',6.8,2.1,13.6,4.5,.32,2.6,-.22,{x:.22}),
    cyl('round-procedural-dais','#7060a8',8.2,.42,-2.5,1.7,.84,true),cyl('tall-round-column-blocker','#66594d',10.8,1.35,-4.9,.62,2.7,false),
    sphere('floating-moon-orb','#526f99',-7,1.7,-4.5,1.1),diamond('silver-air-diamond','#8491aa',-9.8,1.8,-6.3,1.6,.7),
    platform('zig-platform-a','#82633f',5.5,.52,5.8,2.3,.36,1.8,.95),platform('zig-platform-b','#7c5b43',8.6,.98,7.2,2.2,.36,1.8,-.2)
  ];
  defs.assets=assets;return defs;
}
function stairs(prefix,x,z,yaw){const out=[];for(let i=0;i<7;i++){const p=stepPoint(x,z,yaw,i*.82);out.push(platform(`${prefix}-${i+1}`,'#9b7849',p.x,.13+i*.18,p.z,1.55,.26,.9,yaw));}return out;}
function stepPoint(x,z,yaw,d){return{x:x+Math.sin(yaw)*d,z:z+Math.cos(yaw)*d};}
function box(id,color,x,y,z,sx,sy,sz,yaw=0,rotation={},walkable=false){return{id,shape:'box',solid:true,walkable,color,position:{x,y,z},size:{x:sx,y:sy,z:sz},yaw,rotation:{y:yaw,...rotation}};}
function platform(...args){return{...box(...args),walkable:true};}
function ceiling(...args){return{...box(...args),walkable:false};}
function diamond(id,color,x,y,z,size,yaw=0){return{id,shape:'diamond',solid:true,walkable:false,color,position:{x,y,z},size:{x:size,y:size,z:size},yaw,rotation:{y:yaw}};}
function doorway(id,color,x,y,z,sx,sy,sz,yaw=0,door={x:2.2,y:2.15}){return{id,shape:'doorway',solid:true,walkable:false,color,position:{x,y,z},size:{x:sx,y:sy,z:sz},door,yaw,rotation:{y:yaw}};}
function cyl(id,color,x,y,z,radius,height,walkable){return{id,shape:'cylinder',solid:true,walkable,color,position:{x,y,z},radius,height,segments:36,rotation:{y:0}};}
function sphere(id,color,x,y,z,radius){return{id,shape:'sphere',solid:true,walkable:false,color,position:{x,y,z},radius,rotation:{y:0}};}
