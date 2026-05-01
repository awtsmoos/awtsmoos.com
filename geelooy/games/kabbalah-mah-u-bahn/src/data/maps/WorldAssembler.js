
import { ChunkAlpha } from './Chunks/ChunkAlpha.js';
import { ChunkBeta } from './Chunks/ChunkBeta.js';

/**
 * B"H
 * WorldAssembler: Binding the fragmented souls of space.
 */
export class WorldAssembler {
    static _memory = null;

    /** 
     * Materializes the 64px world registry from ASCII chunks.
     * Each sector data corresponds to a 20x20 tile layout.
     */
    static getInstance() {
        if (this._memory) return this._memory;
        this._memory = [];

        // Definition of physical world expansion
        const sectors = [
            { ox: 0, oy: 0, data: ChunkAlpha },
            { ox: 20, oy: 0, data: ChunkBeta }
        ];

        sectors.forEach(s => {
            s.data.forEach((row, rowIdx) => {
                [...row].forEach((otiya, colIdx) => {
                    this._memory.push({
                        x: s.ox + colIdx,
                        y: s.oy + rowIdx,
                        t: otiya === '2' ? 'G_T_DET' : 'G_T',
                        solid: otiya === 'T'
                    });
                });
            });
        });

        return this._memory;
    }
}
