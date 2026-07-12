/**
 * B"H
 * @module OhrEncounter
 * @description Small facade over arrival and facing interaction modules.
 */
import { handleTileArrival } from './encounters/ArrivalRuntime.js';
import { handleFacingAction } from './encounters/FacingRuntime.js';

export const handleArrival = () => handleTileArrival();
export const handleActionFacing = front => handleFacingAction(front);
