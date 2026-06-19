// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { RoomPalette as P } from './RoomPalette.js';
export class WindowRenderer {
  static build(w=1200,h=900){const x=w*.62,y=-h*.35,ww=w*.26,hh=h*.25;return G.group('production_window',null,[
    G.rect('curtain_rod',{x:x-35,y:y-28,width:ww+70,height:9,fill:P.curtainGold}),
    G.rect('left_curtain',{x:x-34,y:y-22,width:30,height:hh+52,fill:P.curtain}),G.rect('right_curtain',{x:x+ww+4,y:y-22,width:30,height:hh+52,fill:P.curtain}),
    G.rect('window_sky',{x,y,width:ww,height:hh,fill:'#83d3ff'}),G.circle('window_sun',{x:x+ww*.78,y:y+hh*.28,radius:18,fill:'#ffe56d'}),
    G.rect('window_frame',{x,y,width:ww,height:hh,fill:'rgba(0,0,0,0)',stroke:'#5a3418',lineWidth:8}),
    G.rect('window_mid_v',{x:x+ww/2-3,y,width:6,height:hh,fill:'#5a3418'}),G.rect('window_mid_h',{x,y:y+hh/2-3,width:ww,height:6,fill:'#5a3418'}),
    this.plant('window_plant_a',x+38,y+hh+12,.8),this.plant('window_plant_b',x+ww-44,y+hh+16,.7)
  ]);}
  static plant(id,x,y,s){return G.group(id,null,[G.rect(`${id}_pot`,{x:x-12*s,y:y+12*s,width:24*s,height:22*s,fill:'#7b421f'}),...[-2,-1,0,1,2].map((k,i)=>G.ellipse(`${id}_leaf_${i}`,x+k*7*s,y+(i%2)*4*s,18*s,6*s,k*.35,{fill:'#2f8a3e'}))]);}
}
