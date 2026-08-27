// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
export class LampRenderer { static build(x=310,y=276){return G.group('table_lamp',null,[G.circle('lamp_glow',{x,y:y-60,radius:72,fill:'rgba(255,215,120,.16)'}),G.path('lamp_shade',[{type:'move',x:x-32,y:y-42},{type:'line',x:x+32,y:y-42},{type:'line',x:x+20,y:y-78},{type:'line',x:x-20,y:y-78},{type:'line',x:x-32,y:y-42}],{fill:'#f7d56a',stroke:'#5a3418',lineWidth:3}),G.rect('lamp_stand',{x:x-4,y:y-42,width:8,height:50,fill:'#5a3418'}),G.ellipse('lamp_base',x,y+10,30,8,0,{fill:'#5a3418'})]);} }
