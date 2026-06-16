// B"H
/**
 * @file RegionFarmRenderer.js
 * @description Farms now prefer parcel gardens; fallback rows remain for older reports.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js?v=awtsmoos-instancer-20260614-bh2";
import { sealRegionVisual } from "./RegionSeal.js";
import { qualityCount } from "./RegionQuality.js?v=awtsmoos-quality-20260614-bh2";
import { registerFarmPlots } from "../../../../../systems/farming/FarmPlotRegistry.js";
const FARM = Object.freeze({ x:-150, z:-42, rowX:36, rowGapX:1.4, rowGapZ:2.1 });
function houses(report) { return Array.isArray(report?.houses) ? report.houses : []; }
function parcels(report) { const h = houses(report); return Array.isArray(h.parcels) ? h.parcels : h.map(x => x.parcel).filter(Boolean); }
function parcelGardens(report) { return parcels(report).map(p => p.garden).filter(Boolean); }
function ecologyCells(report) { return report && report.ecology && Array.isArray(report.ecology.cells) ? report.ecology.cells : []; }
function farmCells(report) { return ecologyCells(report).filter(cell => cell.biome === "farmBelt"); }
function farmCell(report, i) { const cells = farmCells(report); return cells.length ? cells[i % cells.length] : { x:FARM.x + (i % FARM.rowX) * FARM.rowGapX, z:FARM.z + Math.floor(i / FARM.rowX) * FARM.rowGapZ }; }
function bedList(report) { return parcelGardens(report).flatMap(g => (g.beds || []).map(b => ({ ...b, parcelId:g.parcelId, gardenId:g.id, crop:g.crop }))); }
function bedSpec(bed, i, scale) { return { x:bed.x + ((i % 3) - 1) * .12, z:bed.z + ((i % 2) - .5) * .14, sx:scale[0], sy:scale[1], sz:scale[2], yaw:(i % 4) * .18, lift:.03 }; }
function rowSpec(report, i, scale, materialLift = .02) { const c = farmCell(report, i); return { x:c.x + ((i % 5) - 2) * .07, z:c.z + ((i % 7) - 3) * .05, sx:scale[0], sy:scale[1], sz:scale[2], yaw:(i % 4) * .12, lift:materialLift }; }
function cropLayer(olam, report, name, geometry, material, count, scale, offset = 0) { return makeInstancedLayer({ olam, name, geometry, material, count, simple:false, build:i => rowSpec(report, i + offset, scale) }); }
function parcelCropLayer(olam, beds, crop, name, geometry, material, scale) {
  const filtered = beds.filter(b => b.crop === crop || b.crop === material || (crop === "vegetable" && !["wheat", "orchard"].includes(b.crop)));
  return makeInstancedLayer({ olam, name, geometry, material, count:filtered.length, simple:false, build:i => bedSpec(filtered[i], i, scale) });
}
export function buildFarmRenderer(olam, report = {}) {
  const root = new THREE.Group(); root.name = "living_region_grounded_textured_farms_and_parcel_beds";
  const gardens = parcelGardens(report), beds = bedList(report);
  if (gardens.length) registerFarmPlots(olam, gardens);
  if (beds.length) {
    root.add(parcelCropLayer(olam, beds, "wheat", "parcel_wheat_bed_markers", "grassTuft", "wheatGold", [.26,.68,.26]));
    root.add(parcelCropLayer(olam, beds, "vegetable", "parcel_vegetable_bed_markers", "stem", "carrotSkin", [.18,.45,.18]));
    root.add(parcelCropLayer(olam, beds, "orchard", "parcel_orchard_seedlings", "canopy", "cabbageLeaf", [.52,.42,.52]));
  } else {
    const carrots = qualityCount(olam, 360), cabbages = qualityCount(olam, 180), onions = qualityCount(olam, 120);
    root.add(cropLayer(olam, report, "instanced_carrot_rows_grounded", "stem", "carrotSkin", carrots, [.16,.52,.16]));
    root.add(cropLayer(olam, report, "instanced_cabbage_leaf_heads", "canopy", "cabbageLeaf", cabbages, [.46,.32,.46], 701));
    root.add(cropLayer(olam, report, "instanced_onion_sprout_rows", "grassTuft", "onionSkin", onions, [.22,.44,.22], 1301));
  }
  const sacks = qualityCount(olam, 34);
  root.add(makeInstancedLayer({ olam, name:"instanced_linen_and_cotton_sacks", geometry:"road", material:"linenFabric", count:sacks, build:i => ({ x:-82+(i%7)*.75, z:-30+Math.floor(i/7)*.7, sx:.48, sy:.38, sz:.55, yaw:i*.2, lift:.03 }) }));
  root.userData.stats = { parcelGardens:gardens.length, parcelBeds:beds.length, sacks, groundedFarm:true, texturedFarm:true, farmPlotsRegistered:Boolean(gardens.length) };
  return sealRegionVisual(root, { groundedFarm:true, texturedFarm:true, parcelFarm:true });
}
