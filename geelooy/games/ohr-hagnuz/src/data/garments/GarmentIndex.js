
import { WhiteLinen } from './WhiteLinen.js';
import { DarkRobe } from './DarkRobe.js';
import { GoldRobe } from './GoldRobe.js';
import { TzitzitOfLight } from './TzitzitOfLight.js';
import { KittelOfPurity } from './KittelOfPurity.js';
import { GartelOfSeparation } from './GartelOfSeparation.js';

/**
 * B"H
 * @module GarmentIndex
 * @description
 * The Seder Histalshelus of the Garments. All modular items are aggregated here.
 */
export const GarmentIndex = {
    [WhiteLinen.id]: WhiteLinen,
    [DarkRobe.id]: DarkRobe,
    [GoldRobe.id]: GoldRobe,
    [TzitzitOfLight.id]: TzitzitOfLight,
    [KittelOfPurity.id]: KittelOfPurity,
    [GartelOfSeparation.id]: GartelOfSeparation
};
