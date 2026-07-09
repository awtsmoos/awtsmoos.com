// B"H
/** @file InteriorClutterRecipe.js @description Lived-in interiors with fresh RAM shader material import. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { rvGroup, rvMesh, rvSeal } from "./RealisticVillageMaterials.js?compact=true&v=awtsmoos-realistic-village-materials-20260614-bh3";
function add(g, kind, mat, p, s, r = [0,0,0], op = {}) { const m = rvMesh(kind, mat, p, s, r, op); g.add(m); return m; }
function table(g, x, z) { add(g,"box","wood",[x,.38,z],[.92,.12,.58]); for (const dx of [-.36,.36]) for (const dz of [-.22,.22]) add(g,"box","darkWood",[x+dx,.18,z+dz],[.07,.36,.07]); }
function bench(g, x, z, rot = 0) { add(g,"box","wood",[x,.22,z],[.72,.09,.18],[0,rot,0]); add(g,"box","darkWood",[x-.24,.11,z],[.06,.22,.06],[0,rot,0]); add(g,"box","darkWood",[x+.24,.11,z],[.06,.22,.06],[0,rot,0]); }
function books(g, x, y, z) { for (let i=0;i<7;i++) add(g,"box",i%3?"rug":"burlap",[x+i*.055,y,z],[.045,.16+.03*(i%2),.18]); }
function shelf(g, x, z, rot = 0) { add(g,"box","darkWood",[x,.65,z],[.14,1.1,.72],[0,rot,0]); for (const y of [.38,.68,.94]) add(g,"box","wood",[x,y,z],[.18,.05,.8],[0,rot,0]); books(g,x+.12,.79,z-.24); books(g,x+.12,.49,z+.05); }
function bed(g, x, z, rot = 0) { add(g,"box","wood",[x,.19,z],[1.05,.18,.68],[0,rot,0]); add(g,"box","burlap",[x,.33,z],[.94,.08,.6],[0,rot,0]); add(g,"box","plaster",[x+.32,.43,z-.18],[.28,.08,.22],[0,rot,0]); add(g,"box","rug",[x-.1,.43,z+.12],[.58,.06,.46],[0,rot,0]); }
function sacks(g, x, z) { add(g,"sphere","burlap",[x,.25,z],[.28,.42,.24]); add(g,"sphere","burlap",[x+.28,.2,z+.08],[.22,.32,.2]); add(g,"box","wood",[x-.25,.18,z-.12],[.36,.26,.3]); }
function pots(g, x, z) { add(g,"cylinder","roof",[x,.22,z],[.18,.34,.18]); add(g,"sphere","mud",[x+.26,.18,z+.18],[.16,.22,.16]); add(g,"cylinder","cobble",[x-.24,.18,z+.08],[.13,.25,.13]); }
function lamp(g, x, z) { add(g,"box","darkWood",[x,.72,z],[.05,.44,.05]); add(g,"sphere","straw",[x,.98,z],[.13,.13,.13],[0,0,0],{ unlit:true }); const l = new THREE.PointLight(0xffce82,.28,3.2,2); l.position.set(x,1,z); g.add(l); }
function rug(g, x, z, sx = 1.35, sz = .9, rot = 0) { add(g,"box","rug",[x,.055,z],[sx,.025,sz],[0,rot,0]); }
function kitchen(g) { table(g,.15,-.58); bench(g,.15,-1.05,0); bench(g,.15,-.12,0); pots(g,1.25,-1.28); shelf(g,-2.38,-.08,0); lamp(g,.75,-1.8); }
function bedroom(g) { bed(g,2.08,.72,-.1); add(g,"box","wood",[1.1,.24,1.15],[.55,.32,.38]); sacks(g,-1.65,-1.18); }
function study(g) { shelf(g,-2.42,.86,0); add(g,"box","wood",[-1.55,.35,.92],[.55,.1,.42]); books(g,-1.73,.52,.82); lamp(g,-1.22,.78); }
function family(g) { rug(g,-.42,.42,1.45,.92,.08); add(g,"box","burlap",[-.98,.22,.98],[.34,.32,.34]); add(g,"sphere","straw",[-.55,.28,1.18],[.18,.18,.18]); }
export function buildRealisticInteriorDetails(group, options = {}) { const root = rvGroup("ram_shader_cottage_lived_in_interior"); add(root,"box","wood",[0,.025,-.1],[6.25,.05,4.15]); kitchen(root); bedroom(root); study(root); family(root); rvSeal(root); group.add(root); return root; }
