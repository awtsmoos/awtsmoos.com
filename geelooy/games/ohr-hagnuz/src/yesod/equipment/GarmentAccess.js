/**
 * B"H
 * @module GarmentAccess
 * Reads garment data from the existing GarmentIndex.
 */
import { GarmentIndex } from '../../data/garments/GarmentIndex.js';

export const getGarment = (id) => GarmentIndex[id] || null;
export const allGarments = () => Object.values(GarmentIndex);
export const allGarmentIds = () => Object.keys(GarmentIndex);

export const garmentStatMod = (id) => {
  const garment = getGarment(id);
  return garment?.statMod || {};
};
