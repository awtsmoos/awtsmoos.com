// B"H
/**
 * @file VillageVisualRealityLayer.js
 * @description Grounded village clutter uses the same polish ground law and parser-clear material vessels.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { yAt } from "./VillagePolishGround.js?compact=true&v=awtsmoos-polish-ground-20260614-bh2";
import { rvGroup, rvMesh, rvSeal } from "../../../../dvarim/nature/villagePicture/RealisticVillageMaterials.js?compact=true&v=awtsmoos-realistic-village-materials-20260614-bh2";
const KEY = "__awtsmoosVillageVisualRealityLayer";
function sceneOf(context, olam) { return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null; }
function add(g, kind, mat, x, z, s, rot = 0, y = 0) { const m = rvMesh(kind, mat, [x, y + s[1] * .5, z], s, [0, rot, 0], { repeat:2 }); g.add(m); return m; }
function grounded(root, olam, name, x, z, rot, build) { const wrap = new THREE.Group(); wrap.name = name; wrap.position.set(x, yAt(olam, x, z) + .015, z); wrap.rotation.y = rot || 0; build(wrap); root.add(wrap); return wrap; }
function barrel(g, x, z, r = 0) { add(g,"cylinder","darkWood",x,z,[.32,.7,.32],r); add(g,"box","wood",x,z,[.72,.06,.72],r,.34); }
function crate(g, x, z, r = 0) { add(g,"box","wood",x,z,[.55,.5,.55],r); add(g,"box","darkWood",x,z,[.62,.08,.62],r,.5); }
function sack(g, x, z) { add(g,"sphere","burlap",x,z,[.33,.48,.28]); }
function woodPile(g, x, z, r = 0) { for (let i=0;i<5;i++) add(g,"cylinder","darkWood",x+i*.12,z+(i%2)*.09,[.08,.82,.08],r+Math.PI/2,.08+i*.04); }
function cartLocal(g, x, z, r = 0) { add(g,"box","wood",x,z,[1.1,.28,.62],r,.25); add(g,"cylinder","darkWood",x-.45,z+.42,[.18,.1,.18],Math.PI/2,.18); add(g,"cylinder","darkWood",x+.45,z+.42,[.18,.1,.18],Math.PI/2,.18); add(g,"box","darkWood",x+.82,z,[.75,.07,.09],r,.32); }
function rugLine(g, x, z, r = 0) { add(g,"box","rug",x,z,[1.2,.035,.72],r,.025); add(g,"box","burlap",x+.8,z+.18,[.42,.035,.36],r,.03); }
function garden(g, x, z) { for (let i=0;i<12;i++) add(g,"box",i%2?"grass":"dry",x+(i-6)*.18,z+Math.sin(i)*.2,[.06,.38+((i%3)*.08),.06],i*.7); }
function cluster(g, x, z, r = 0) { barrel(g,x,z,r); crate(g,x+.72,z-.18,r+.2); sack(g,x-.62,z+.2); woodPile(g,x+.22,z+.75,r); }
function build(olam) {
  const g = rvGroup("village_ram_shader_exterior_clutter_layer_grounded");
  const spots = [[-36,22,.2],[48,38,-.4],[108,58,.1],[-92,-38,.7],[155,-70,-.3],[-160,88,.5],[18,-18,.4]];
  for (const spot of spots) { const x=spot[0], z=spot[1], r=spot[2]; grounded(g, olam, "grounded_clutter", x, z, r, wrap => { cluster(wrap,0,0,0); if (Math.abs(x)<80) rugLine(wrap,1.15,.6,0); if (z>20) garden(wrap,-1.1,.7); }); }
  grounded(g, olam, "grounded_cart_left", -20, 12, .4, wrap => cartLocal(wrap, 0, 0, 0));
  grounded(g, olam, "grounded_cart_right", 82, 47, -.2, wrap => cartLocal(wrap, 0, 0, 0));
  rvSeal(g); return g;
}
export async function ensureVillageVisualRealityLayer(context = {}) { const olam = context.olam || context, scene = sceneOf(context, olam); if (!scene || !olam) return null; if (olam[KEY]) return olam[KEY]; const g = build(olam); scene.add(g); olam[KEY] = g; return g; }
