// B"H
/** @file HouseInteriorSpawner.js @description Interior content by profession. */
import { HOUSE_PROFESSIONS } from './HouseProfessionCatalog.js';export function interiorFor(profession='farmer'){return HOUSE_PROFESSIONS[profession]?.props||['table','bed','lamp'];}
