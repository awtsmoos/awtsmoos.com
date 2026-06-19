// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
export class StableGlasses2D { static build(data={},c={},m={},view={}){if(!data.glasses)return null;const spread=view.head?.eyeSpread||15;return G.group('stable_round_glasses',null,[G.ellipse('glasses_l',-spread,m.headY-8,9,8,0,{stroke:'#111',lineWidth:2,fill:'rgba(255,255,255,.05)'}),G.ellipse('glasses_r',spread,m.headY-8,9,8,0,{stroke:'#111',lineWidth:2,fill:'rgba(255,255,255,.05)'}),G.path('glasses_bridge',[{type:'move',x:-6,y:m.headY-8},{type:'line',x:6,y:m.headY-8}],{stroke:'#111',lineWidth:1.6})]);} }
