// B"H
/** @file RegionGrassRenderer.js @description More grass by texture + tiered tufts, not pixel cost. */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js?v=awtsmoos-instancer-20260614-bh2";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { budgetedQualityCount } from "./RegionQuality.js?v=awtsmoos-quality-20260614-bh2";
import { createProceduralCoreGrassField, advanceProceduralGrass } from "./ProceduralCoreGrassField.js?v=mobile-bright-grass-20260707-bh1";
import { grassExclusionsFromReport, auditGrassExclusions } from "./RegionGrassExclusion.js";
import { regionMaterial } from "./RegionMaterials.js?v=ping-pong-crisp-textures-20260622-bh2";

const CARPETS = Object.freeze([[0,0,720,480,-.02],[-160,-70,260,170,-.014],[150,60,280,185,-.012],[0,145,360,135,-.016]]);

function reportGrass(report) {
  return report?.instances && Array.isArray(report.instances.grass) ? report.instances.grass : [];
}

function farmCells(report) {
  const cells = report?.ecology && Array.isArray(report.ecology.cells) ? report.ecology.cells : [];
  return cells.filter(x => x.biome === "farmBelt");
}

function carpet([x, z, w, h, y], i) {
  const geometry = new THREE.PlaneGeometry(w, h, 1, 1);
  geometry.rotateX(-Math.PI / 2);
  const material = regionMaterial("grass", { side:THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `hyperrepeat_grass_carpet_${i}`;
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.frustumCulled = false;
  Object.assign(mesh.userData, {
    pingPongGrassCarpet:true,
    hyperRepeat:true,
    smallTexture:true,
    nonPixelated:true,
    visualOnly:true,
    skipOctree:true,
    noOctree:true,
    carpetIndex:i
  });
  return mesh;
}

function addCarpets(root) {
  CARPETS.forEach((c, i) => root.add(carpet(c, i)));
}

export function buildGrassRenderer(olam, report = {}) {
  const root = new THREE.Group();
  const specs = reportGrass(report);
  const exclusions = grassExclusionsFromReport(report);
  const audit = auditGrassExclusions(report);
  const near = Math.max(1800, Math.min(3600, budgetedQualityCount(olam, 3200, "grassDistance", 3600)));
  const grass = createProceduralCoreGrassField(olam, specs, near, { exclusions });
  root.name = "living_region_more_grass_hyperrepeat_lod_system";
  addCarpets(root);
  root.add(grass);
  root.userData.tick = delta => advanceProceduralGrass(grass, delta);
  root.userData.stats = {
    ...grass.userData.stats,
    carpetPatches:CARPETS.length,
    carpetDrawCalls:CARPETS.length,
    nearTufts:near,
    perceivedBlades:near * 18,
    pingPongRepeat:true,
    hyperRepeat:true,
    nonPixelated:true,
    smallTexture:true,
    moreGrass:true,
    smartGrassLOD:true,
    grassExclusionAudit:audit
  };
  return sealRegionVisual(root, { layeredPingPongGrass:true, hyperRepeatGrass:true, moreGrass:true, smartLOD:true, nonPixelated:true });
}

export function buildWheatRenderer(olam, report = {}) {
  const cells = farmCells(report);
  const count = Math.min(1800, budgetedQualityCount(olam, Math.min(1800, Math.max(720, cells.length * 3)), "grassDistance", 1800));
  return makeInstancedLayer({
    olam,
    name:"living_region_more_wheat_heads",
    geometry:"grassTuft",
    material:"straw",
    count,
    build:i => {
      const c = cells[i % Math.max(1, cells.length)] || { x:-145, z:-55 };
      return {
        x:c.x + (rand(i, 1) - .5) * 6,
        z:c.z + (rand(i, 2) - .5) * 6,
        sx:.44,
        sy:1.45 + rand(i, 6) * 1.1,
        sz:.44,
        yaw:rand(i, 7) * 6.28,
        lift:.018,
        color:i % 4 ? 0xd5bf62 : 0xf3db83
      };
    }
  });
}
