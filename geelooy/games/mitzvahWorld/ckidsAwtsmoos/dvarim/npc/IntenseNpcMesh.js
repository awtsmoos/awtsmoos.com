// B"H
/**
 * @module IntenseNpcMesh
 * @description
 * A single-mesh Jewish NPC generator. The Awtsmoos gathers hat, peyos, beard,
 * kapote, shirt, hands, face, tzitzis, and inner glow into one BufferGeometry
 * mesh with material groups instead of orbiting fragments and invisible proxy
 * children. The shliach sees a clearer Yid; the renderer sees one mesh.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const MAT = Object.freeze({ coat:0, shirt:1, skin:2, hair:3, hat:4, tzitzis:5, glow:6 });
const COLORS = [0x111111, 0xf7f3e8, 0xd3a277, 0x3a2518, 0x080808, 0xf8f8e8, 0x62f5ff];

function pushBox(ctx, center, size, materialIndex) {
  const [cx, cy, cz] = center, [sx, sy, sz] = size;
  const x=sx/2,y=sy/2,z=sz/2, base=ctx.positions.length/3;
  const verts=[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]];
  for (const v of verts) ctx.positions.push(cx+v[0], cy+v[1], cz+v[2]);
  const inds=[0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0].map(i=>i+base);
  const start=ctx.indices.length; ctx.indices.push(...inds); ctx.groups.push({ start, count:inds.length, materialIndex });
}

function geometry() {
  const ctx={ positions:[], indices:[], groups:[] };
  pushBox(ctx, [0, .82, 0], [.58, 1.22, .34], MAT.coat);
  pushBox(ctx, [0, 1.12, -.185], [.32, .7, .045], MAT.shirt);
  pushBox(ctx, [-.43, .88, 0], [.14, .86, .16], MAT.coat);
  pushBox(ctx, [.43, .88, 0], [.14, .86, .16], MAT.coat);
  pushBox(ctx, [-.24, .16, 0], [.16, .36, .16], MAT.coat);
  pushBox(ctx, [.24, .16, 0], [.16, .36, .16], MAT.coat);
  pushBox(ctx, [0, 1.72, 0], [.38, .38, .32], MAT.skin);
  pushBox(ctx, [0, 1.5, -.19], [.26, .28, .035], MAT.hair);
  pushBox(ctx, [-.245, 1.58, -.05], [.045, .42, .045], MAT.hair);
  pushBox(ctx, [.245, 1.58, -.05], [.045, .42, .045], MAT.hair);
  pushBox(ctx, [0, 1.98, 0], [.68, .06, .5], MAT.hat);
  pushBox(ctx, [0, 2.12, 0], [.42, .26, .36], MAT.hat);
  pushBox(ctx, [-.12, .78, -.225], [.025, .58, .025], MAT.tzitzis);
  pushBox(ctx, [.12, .78, -.225], [.025, .58, .025], MAT.tzitzis);
  pushBox(ctx, [0, 1.08, -.238], [.1, .16, .018], MAT.glow);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ctx.positions), 3));
  geo.setIndex(ctx.indices);
  ctx.groups.forEach(g => geo.addGroup(g.start, g.count, g.materialIndex));
  geo.computeVertexNormals(); geo.computeBoundingSphere(); geo.computeBoundingBox();
  return geo;
}

function materials(hexColor) {
  const aura = new THREE.Color(hexColor);
  return COLORS.map((color, index) => new THREE.MeshStandardMaterial({
    color: index === MAT.glow ? aura : color,
    emissive: index === MAT.glow ? aura : new THREE.Color(0x000000),
    emissiveIntensity: index === MAT.glow ? 2.2 : 0,
    roughness: index === MAT.hat ? .42 : .78,
    metalness: 0
  }));
}

export default class IntenseNpcMesh {
  static build(hexColor = "#00ffff") {
    const mesh = new THREE.Mesh(geometry(), materials(hexColor));
    mesh.name = "single_mesh_jewish_npc_vessel";
    mesh.userData = { singleMeshJewishNpc:true, renderMeshCount:1, isSolid:true, selectableNpc:true, jewishDetails:["black_hat", "peyos", "beard", "kapote", "tzitzis"] };
    mesh.userData.onUpdate = () => {
      const time = performance.now() * .001, pulse = 1 + Math.sin(time * 2) * .025;
      mesh.scale.set(pulse, 1, pulse);
    };
    return mesh;
  }
}
