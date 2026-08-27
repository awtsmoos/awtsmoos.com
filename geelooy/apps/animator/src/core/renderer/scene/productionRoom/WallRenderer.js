// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { RoomPalette as P } from './RoomPalette.js';
export class WallRenderer {
  static build(w=1200,h=900){return G.group('production_wall',null,[
    G.rect('warm_wall_deep_coverage',{x:-w,y:-h*2,width:w*3,height:h*3,fill:P.wall}),
    G.rect('warm_wall_soft_center',{x:-w*.2,y:-h*.65,width:w*1.4,height:h*1.3,fill:P.wallSoft,opacity:.45}),
    ...this.texture(w,h), ...this.molding(w,h)
  ]);}
  static texture(w,h){const nodes=[];for(let i=0;i<26;i++){nodes.push(G.rect(`wall_plaster_${i}`,{x:-w+i*92,y:-h*.55+(i%7)*58,width:64,height:3,fill:'rgba(110,70,35,.055)'}));}return nodes;}
  static molding(w,h){return [G.rect('back_chair_rail_shadow',{x:-w,y:h*.29,width:w*3,height:8,fill:'#9b612f'}),G.rect('back_chair_rail_high',{x:-w,y:h*.285,width:w*3,height:3,fill:'#f3c47b'}),G.rect('baseboard_dark',{x:-w,y:h*.52,width:w*3,height:18,fill:P.woodDark})];}
}
