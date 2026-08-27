// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { RoomPalette as P } from './RoomPalette.js';
export class BookcaseRenderer {
  static build(w=1200,h=900){return G.group('production_bookcases',null,[this.case('left',w*.06,-h*.38,w*.28,h*.36),this.case('right',w*.68,-h*.34,w*.23,h*.3)]);}
  static case(id,x,y,ww,hh){const shelves=[0.22,0.48,0.74];return G.group(`bookcase_${id}`,null,[
    G.rect(`${id}_case_back`,{x,y,width:ww,height:hh,fill:'#6b3c1d',stroke:'#2a170b',lineWidth:4}),
    ...shelves.map((s,i)=>G.rect(`${id}_shelf_${i}`,{x:x+8,y:y+hh*s,width:ww-16,height:8,fill:'#3b2110'})),
    ...this.books(id,x+18,y+22,ww-34,hh-38)
  ]);}
  static books(id,x,y,ww,hh){const colors=[P.bookBlue,P.bookGreen,P.bookRed,P.bookGold,'#463064','#7a4a21'];const nodes=[];let n=0;for(let row=0;row<3;row++){for(let i=0;i<9;i++){const bw=12+(i%3)*4,bh=36+(i%4)*7;nodes.push(G.rect(`${id}_book_${n}`,{x:x+i*(ww/10),y:y+row*(hh/3)+46-bh,width:bw,height:bh,fill:colors[(i+row)%colors.length],stroke:'#1b0f08',lineWidth:1}));n++;}}return nodes;}
}
