// B"H
/** @file WildlifeDirector.js @description Wildlife orchestration plan. */
import { animalTerritories } from './AnimalTerritories.js';import { predatorPreySchedule } from './PredatorPreyScheduler.js';export function buildWildlifePlan(){return {territories:animalTerritories(),events:predatorPreySchedule(),simulation:'needs-territory-predator-prey'};}
