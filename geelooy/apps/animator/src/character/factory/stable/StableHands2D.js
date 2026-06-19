// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
export class StableHands2D { static fingers(id,x,y,skin='#d49a73',line='#111',open=true){return G.group(`${id}_fingers`,null,Array.from({length:5},(_,i)=>G.path(`${id}_finger_${i}`,[{type:'move',x:x+(i-2)*3,y},{type:'quad',cx:x+(i-2)*4,y:y+(open?-8:-3),x:x+(i-2)*5,y:y+(open?-14:-6)}],{stroke:skin,lineWidth:2.4,lineCap:'round'})).concat([G.circle(`${id}_palm`,{x,y:y+2,radius:6,fill:skin,stroke:line,lineWidth:1.6})]));} }
