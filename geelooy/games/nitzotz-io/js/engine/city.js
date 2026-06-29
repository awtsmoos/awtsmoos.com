// B'H
import { chunkCenter, hashKey } from './chunks.js';
import { rng, TAU } from '../math.js';
const NAMES=['letter','bench','bush','cedar','cart','house','arch','tower','cloud','star','gate'];
const HOODS=['Plaza','Forest','Market','Courtyard','Tower','Sky','Outer'];
export function createCity(seed,worldIndex,budget){const keys=['0,0','-2,1','2,1','-2,-2','2,-2','0,3'],out=[];let id=0;for(const key of keys)out.push(...chunkObjects(key,seed,worldIndex,budget,()=>id++));return out}
export function createChunk(seed,worldIndex,key,budget,nextId){return chunkObjects(key,seed,worldIndex,budget,nextId)}
function chunkObjects(key,seed,worldIndex,budget,nextId){const rand=rng(hashKey(key,seed+worldIndex*101)),c=chunkCenter(key),out=[],hood=hoodFor(key);for(let i=0;i<budget;i++){const a=i/budget*TAU+rand()*.55,r=55+rand()*250,tier=Math.min(NAMES.length-1,hood.tier+Math.floor(rand()*3));out.push({id:nextId(),chunk:key,hood:hood.name,kind:NAMES[tier],x:c.x+Math.cos(a)*r,y:c.y+Math.sin(a)*r,rot:rand()*TAU})}return out}
function hoodFor(key){const [x,y]=key.split(',').map(Number),n=Math.abs(x*3+y*5)%HOODS.length;return{name:HOODS[n],tier:Math.max(0,Math.min(9,Math.abs(x)+Math.abs(y)+n%3))}}
