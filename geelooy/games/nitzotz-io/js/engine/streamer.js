// B'H
import { chunkKey, nearbyChunks } from './chunks.js';
export function createStreamer(engine,worldIndex,budget,radius=2){let next=1,last='',active=[],visible=[];const cache=new Map();function ensure(key){if(!cache.has(key)){const raw=engine.chunk(worldIndex,key,budget,()=>next++);cache.set(key,raw.map(o=>engine.object(o,tier(o.kind,worldIndex),worldIndex)))}return cache.get(key)}function update(x,y){const center=chunkKey(x,y);if(center===last&&visible.length)return visible;last=center;active=nearbyChunks(x,y,radius);visible=active.flatMap(ensure);return visible}return{update,get visible(){return visible},get active(){return active},get cached(){return cache.size}}}
const BASE={letter:[7,5,12,42],bench:[11,9,14,72],bush:[14,15,34,108],cedar:[22,30,70,145],cart:[28,48,36,28],house:[40,82,80,205],arch:[54,128,98,235],tower:[62,170,175,260],cloud:[72,230,58,188],star:[92,330,75,56],gate:[110,560,140,294]};
const WORLD=[[42,1],[188,1.22],[265,1.48],[310,1.8]];
function tier(kind,wi){const b=BASE[kind]||BASE.letter,w=WORLD[wi%WORLD.length];return{r:b[0]*w[1]*.9,sparks:Math.round(b[1]*w[1]),h:b[2]*w[1],hue:(b[3]+w[0])%360}}
