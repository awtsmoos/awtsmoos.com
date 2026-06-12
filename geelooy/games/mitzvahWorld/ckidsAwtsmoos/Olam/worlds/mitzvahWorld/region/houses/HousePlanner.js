// B"H
/** @file HousePlanner.js @description House placement/profession plan. */
import { interiorFor } from './HouseInteriorSpawner.js';const H=[[-45,22,'farmer'],[20,35,'baker'],[75,50,'shepherd'],[-85,-15,'scribe']];export function buildHousePlan(){return H.map(([x,z,profession],i)=>({id:`house-${i}`,x,z,profession,interior:interiorFor(profession),collider:'hard-shell'}));}
