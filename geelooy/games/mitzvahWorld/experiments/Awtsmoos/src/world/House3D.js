// B"H
import { createModularHouse, modularHouseAnchors, modularHouseDoorDef, modularHouseRoadStart, DEFAULT_HOUSE_SPEC, createFutureHouseSpecs } from './ModularHouseSystem.js';
const DISTRICT_SPECS=createFutureHouseSpecs(DEFAULT_HOUSE_SPEC);

/** One village specification feeds visuals, stairs, roads, and every dynamic door. */
export function createHouseDefs(assets={},groundSampler){return[...createModularHouse(assets,DEFAULT_HOUSE_SPEC,groundSampler),...DISTRICT_SPECS.flatMap(spec=>createModularHouse(assets,spec,groundSampler))];}
export function houseDoorDef(assets={},groundSampler){return modularHouseDoorDef(assets,DEFAULT_HOUSE_SPEC,groundSampler);}
export function allHouseDoorDefs(assets={},groundSampler){return[DEFAULT_HOUSE_SPEC,...DISTRICT_SPECS].map(spec=>modularHouseDoorDef(assets,spec,groundSampler));}
export function houseRoadStart(){return modularHouseRoadStart(DEFAULT_HOUSE_SPEC);}
export function houseAnchors(){return modularHouseAnchors(DEFAULT_HOUSE_SPEC);}
export function houseDistrictHooks(){return DISTRICT_SPECS.map(spec=>({spec,anchors:modularHouseAnchors(spec)}));}
export function houseAllAnchors(){return{main:houseAnchors(),district:houseDistrictHooks().map(h=>h.anchors)};}
export function manualShape(id,material,position,vertices,faces,{yaw=0,walkable=false,solid=true}={}){return{id,shape:'manual',solid,walkable,...material,position,vertices,faces,rotation:{y:yaw},yaw};}
