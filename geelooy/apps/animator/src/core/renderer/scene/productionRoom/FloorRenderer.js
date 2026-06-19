// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { RoomPalette as P } from './RoomPalette.js';
export class FloorRenderer {
  static build(w=1200,h=900){const y=h*.54;return G.group('production_floor',null,[
    G.rect('floor_base',{x:-w,y,width:w*3,height:h*2,fill:'#c98543'}),
    ...Array.from({length:12},(_,i)=>G.rect(`floor_plank_${i}`,{x:-w,y:y+i*42,width:w*3,height:3,fill:'rgba(80,40,15,.18)'})),
    G.ellipse('large_room_rug_shadow',w*.5,h*.79,w*.34,h*.04,0,{fill:'rgba(91,48,20,.18)'})
  ]);}
}
