// B"H
/** @file RoadNetwork.js @description Road graph: yellow brick, farms, trails, bridges. */
import { solveValleyRoads } from '../terrain/ValleyRoadSolver.js';
export function buildRoadNetwork(ctx={}){const valley=solveValleyRoads(ctx.terrain||{valleys:[]});return {main:{id:'yellow-brick-main',points:[[-145,-42],[-90,-8],[-25,8],[45,22],[135,72]],material:'yellowBrick'},farm:{id:'farm-road',points:[[-40,5],[-100,-25],[-155,-45]],material:'dirt'},trails:valley,bridges:[[85,5]],version:'road-network-v1'};}
