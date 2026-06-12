// B"H
/** @file NpcScheduleDirector.js @description Builds daily NPC schedule plan. */
import { npcRouteNetwork } from './NpcRouteNetwork.js';import { NPC_PROFESSION_BEHAVIORS } from './NpcProfessionBehaviors.js';export function buildNpcSchedulePlan(ctx={}){return {routes:npcRouteNetwork(ctx.roads),behaviors:NPC_PROFESSION_BEHAVIORS,dayPhases:['morning','noon','evening','night']};}
