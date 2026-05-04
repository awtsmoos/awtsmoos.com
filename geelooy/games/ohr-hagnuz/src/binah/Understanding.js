
import { SectorAleph } from '../data/maps/SectorAleph.js';

/**
 * B"H
 * Understanding: The Structured Soul of the World.
 * 
 * Here we expand the state to hold the physical layout of the forest.
 * Every 'T' is a tree, every 'S' a sage.
 */
export class Understanding {
    static state = {
        player: {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            speed: 4,
            width: 48,
            height: 48,
            frame: 0,
            animTimer: 0
        },
        map: [],
        entities: [],
        tileSize: 64,
        camera: {
            x: 0,
            y: 0,
            lerp: 0.15
        }
    };

    /**
     * Initialize the world from the SectorAleph blueprint.
     */
    static initialize() {
        const tileSize = this.state.tileSize;
        
        SectorAleph.forEach((row, y) => {
            const mapRow = [];
            [...row].forEach((char, x) => {
                const worldX = x * tileSize;
                const worldY = y * tileSize;

                if (char === 'S') {
                    this.state.entities.push({
                        type: 'NPC_SAGE',
                        x: worldX,
                        y: worldY,
                        width: 64,
                        height: 64
                    });
                    mapRow.push('1'); // Base grass under NPC
                } else {
                    mapRow.push(char);
                }
            });
            this.state.map.push(mapRow);
        });

        // Position player in the center of the first clearing
        this.state.player.x = 2 * tileSize;
        this.state.player.y = 2 * tileSize;
        
        console.log("B\"H - The World of Aleph is understood.");
    }

    static getState() {
        return this.state;
    }
}
