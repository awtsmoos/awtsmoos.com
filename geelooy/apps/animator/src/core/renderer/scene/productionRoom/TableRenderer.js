// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { RoomPalette as P } from './RoomPalette.js';
export class TableRenderer {
  static build(w=1200,h=900){const y=h*.43;return G.group('production_table',null,[
    G.ellipse('table_top_shadow',w*.5,y+38,w*.42,30,0,{fill:'rgba(40,18,6,.22)'}),
    G.rect('table_top_back',{x:w*.1,y:y-20,width:w*.8,height:34,fill:P.woodDark,stroke:P.line,lineWidth:3}),
    G.rect('table_top_face',{x:w*.09,y:y+6,width:w*.82,height:92,fill:P.wood,stroke:P.line,lineWidth:3}),
    G.rect('table_highlight',{x:w*.1,y:y+17,width:w*.8,height:6,fill:'rgba(255,215,147,.38)'}),
    ...Array.from({length:9},(_,i)=>G.rect(`table_grain_${i}`,{x:w*.13+i*w*.08,y:y+36+(i%3)*18,width:w*.055,height:3,fill:'rgba(70,32,12,.24)'}))
  ]);}
}
