// B"H
/** @file awtsmoosTreeVarietyPresets.js @description Bigger custom tree variety vessels generated from data, not imported assets. */

const leaf = (type, count, size, tint, extra = {}) => ({ type, count, size, sizeVariance:0.42, start:0.12, angle:14, billboard:"double", tint, ...extra });
const bark = (type, tint = 0xffffff) => ({ type, tint, textured:true, flatShading:false, textureScale:{ x:1, y:1 } });
const branch = (levels, children, length, radius, angle, force, extra = {}) => ({
  levels, children, length, radius, angle,
  force: force || { direction:{ x:0, y:1, z:0 }, strength:0.015 },
  gnarliness: extra.gnarliness || { 0:0.06, 1:0.14, 2:0.18, 3:0.22, 4:0.25 },
  sections: extra.sections || { 0:10, 1:7, 2:5, 3:4, 4:3 },
  segments: extra.segments || { 0:10, 1:7, 2:5, 3:4, 4:3 },
  start: extra.start || { 1:0.28, 2:0.18, 3:0.12, 4:0.08 },
  taper: extra.taper || { 0:0.62, 1:0.72, 2:0.82, 3:0.92, 4:0.98 },
  twist: extra.twist || { 0:0.02, 1:0.05, 2:-0.04, 3:0.03, 4:0 }
});

export const AWTSMOOS_TREE_VARIETY_PRESETS = Object.freeze({
  "Redwood Giant": { name:"Redwood Giant", seed:90210, type:"evergreen", bark:bark("bark_redwood",0xb98151), branch:branch(2,{0:72,1:6},{0:92,1:28,2:10},{0:3.8,1:.55,2:.16},{1:108,2:40},{direction:{x:0,y:1,z:0},strength:.065},{start:{1:.18,2:.22},sections:{0:14,1:6,2:4},segments:{0:14,1:5,2:3}}), leaves:leaf("leaf_redwood_needle",10,2.6,[0.42,0.72,0.35,1],{start:.06}) },
  "Cedar Broad": { name:"Cedar Broad", seed:8331, type:"evergreen", bark:bark("bark_cedar",0x8b5d3b), branch:branch(3,{0:34,1:8,2:4},{0:48,1:25,2:12,3:4},{0:2.2,1:.55,2:.22,3:.08},{1:95,2:42,3:30},{direction:{x:0,y:.9,z:0},strength:.02}), leaves:leaf("leaf_cedar_spray",14,2.1,[0.36,0.62,0.32,1]) },
  "Cypress Column": { name:"Cypress Column", seed:7337, type:"evergreen", bark:bark("bark_cypress",0x6b513a), branch:branch(3,{0:48,1:6,2:3},{0:52,1:11,2:5,3:2},{0:1.35,1:.32,2:.12,3:.04},{1:24,2:22,3:18},{direction:{x:0,y:1,z:0},strength:.09},{start:{1:.08,2:.1,3:.14},gnarliness:{0:.01,1:.03,2:.04,3:.02}}), leaves:leaf("leaf_cypress_scale",18,1.45,[0.28,0.54,0.25,1]) },
  "Willow Weeping": { name:"Willow Weeping", seed:1207, type:"deciduous", bark:bark("bark_willow",0x76604b), branch:branch(4,{0:9,1:7,2:9,3:10},{0:34,1:22,2:16,3:9,4:5},{0:2.4,1:.82,2:.32,3:.12,4:.04},{1:42,2:72,3:82,4:88},{direction:{x:0,y:-.65,z:0},strength:.055},{start:{1:.34,2:.24,3:.18,4:.12}}), leaves:leaf("leaf_willow",20,1.55,[0.46,0.72,0.25,1],{start:.18}) },
  "Maple Crown": { name:"Maple Crown", seed:6138, type:"deciduous", bark:bark("bark_maple",0x73513b), branch:branch(4,{0:7,1:7,2:8,3:9},{0:38,1:19,2:10,3:5,4:2.4},{0:2.9,1:1.05,2:.42,3:.15,4:.05},{1:48,2:60,3:70,4:78},{direction:{x:0,y:.5,z:0},strength:.025}), leaves:leaf("leaf_maple",18,2.35,[0.74,0.28,0.12,1]) },
  "Olive Ancient": { name:"Olive Ancient", seed:2571, type:"deciduous", bark:bark("bark_olive",0x5f5147), branch:branch(4,{0:5,1:6,2:8,3:8},{0:18,1:14,2:9,3:5,4:2},{0:2.8,1:1.3,2:.55,3:.22,4:.07},{1:64,2:68,3:76,4:82},{direction:{x:.08,y:.25,z:.04},strength:.02},{gnarliness:{0:.22,1:.35,2:.42,3:.48,4:.55},start:{1:.18,2:.12,3:.1,4:.08}}), leaves:leaf("leaf_olive",16,1.15,[0.55,0.65,0.39,1]) },
  "Date Palm": { name:"Date Palm", seed:1901, type:"palm", bark:bark("bark_palm",0x9c764d), branch:branch(1,{0:28},{0:32,1:13},{0:1.15,1:.18},{1:88},{direction:{x:0,y:1,z:0},strength:.08},{start:{1:.92},sections:{0:12,1:4},segments:{0:10,1:4},gnarliness:{0:.015,1:.03}}), leaves:leaf("leaf_palm_frond",28,4.8,[0.38,0.66,0.23,1],{start:.92,angle:82}) },
  "Baobab Giant": { name:"Baobab Giant", seed:4100, type:"deciduous", bark:bark("bark_baobab",0x9a7657), branch:branch(3,{0:8,1:6,2:6},{0:30,1:18,2:8,3:3},{0:6.5,1:1.45,2:.52,3:.16},{1:70,2:58,3:72},{direction:{x:0,y:.18,z:0},strength:.012},{start:{1:.72,2:.2,3:.15},taper:{0:.28,1:.72,2:.85,3:.96}}), leaves:leaf("leaf_baobab",12,2.1,[0.38,0.64,0.28,1],{start:.22}) },
  "Acacia Umbrella": { name:"Acacia Umbrella", seed:8218, type:"deciduous", bark:bark("bark_acacia",0x8a6035), branch:branch(3,{0:5,1:7,2:8},{0:20,1:21,2:11,3:4},{0:1.7,1:.75,2:.28,3:.1},{1:72,2:76,3:82},{direction:{x:0,y:.12,z:0},strength:.008},{start:{1:.62,2:.18,3:.12},gnarliness:{0:.06,1:.1,2:.14,3:.18}}), leaves:leaf("leaf_acacia_pinnate",20,1.2,[0.46,0.68,0.23,1]) },
  "Apple Orchard": { name:"Apple Orchard", seed:5777, type:"deciduous", bark:bark("bark_apple",0x6c4b35), branch:branch(3,{0:6,1:5,2:5},{0:17,1:10,2:6,3:2.5},{0:1.1,1:.5,2:.22,3:.08},{1:55,2:64,3:72},{direction:{x:0,y:.45,z:0},strength:.02}), leaves:leaf("leaf_apple",18,1.65,[0.32,0.72,0.28,1]) },
  "Poplar Tall": { name:"Poplar Tall", seed:6221, type:"deciduous", bark:bark("bark_poplar",0xb0a08b), branch:branch(3,{0:16,1:5,2:3},{0:56,1:14,2:6,3:2},{0:1.25,1:.35,2:.12,3:.04},{1:28,2:34,3:42},{direction:{x:0,y:1,z:0},strength:.07},{start:{1:.16,2:.22,3:.18},gnarliness:{0:.02,1:.04,2:.05,3:.03}}), leaves:leaf("leaf_poplar",15,1.8,[0.45,0.68,0.32,1]) },
  "Mangrove Roots": { name:"Mangrove Roots", seed:9887, type:"deciduous", bark:bark("bark_mangrove",0x5f4636), branch:branch(3,{0:8,1:5,2:4},{0:16,1:13,2:7,3:3},{0:1.4,1:.55,2:.21,3:.08},{1:52,2:66,3:78},{direction:{x:.08,y:.35,z:.04},strength:.025},{start:{1:.2,2:.16,3:.12},gnarliness:{0:.14,1:.22,2:.32,3:.4}}), leaves:leaf("leaf_mangrove",16,1.75,[0.34,0.63,0.31,1]) }
});
export default AWTSMOOS_TREE_VARIETY_PRESETS;
