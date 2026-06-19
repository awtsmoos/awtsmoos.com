// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
export class PlantRenderer { static build(id,x,y,s=1){return G.group(id,null,[G.rect(`${id}_pot`,{x:x-16*s,y:y+15*s,width:32*s,height:28*s,fill:'#7b421f',stroke:'#2a170b',lineWidth:2}),...Array.from({length:8},(_,i)=>G.ellipse(`${id}_leaf_${i}`,x+(i-3.5)*6*s,y+(i%3)*5*s,22*s,7*s,(i-3)*.38,{fill:i%2?'#2f8a3e':'#3fa14a'}))]);} }
