
import { ChunkNorthWest } from './maps/ChunkNorthWest.js';
import { ChunkNorthEast } from './maps/ChunkNorthEast.js';
import { ChunkSouthWest } from './maps/ChunkSouthWest.js';
import { ChunkSouthEast } from './maps/ChunkSouthEast.js';

/**
 * B"H
 * Stores dimensions of Asiyah explicitly assembling fragmented dimensional chunks 
 * seamlessly representing holistic universal arrays avoiding multi-dimensional limiters cleanly
 * combining perfectly smoothly into holistic Seder logic limits!
 */
export class PhysicalWorldBounds {
    static get CurrentGrids() {
        return [
            ...ChunkNorthWest,
            ...ChunkNorthEast,
            ...ChunkSouthWest,
            ...ChunkSouthEast
        ];
    }
}
