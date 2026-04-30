
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import WallCarver from "./WallCarver.js";

export default class WallBuilder {
    static build(blueprint) {
        const w = blueprint.width;
        const h = blueprint.height;
        const d = blueprint.depth;
        const t = blueprint.wallThickness;
        const entrances = blueprint.entrances || [];

        const getHolesForWall = (wallName) => {
            return entrances.filter(e => e.wall === wallName);
        };

        const walls = [];

        // 1. FRONT WALL (+Z, faces outward)
        const frontPieces = WallCarver.carve(w, h, t, getHolesForWall('front'));
        frontPieces.forEach(p => { 
            p.translate(0, 0, d/2 - t/2); 
            walls.push(p); 
        });

        // 2. BACK WALL (-Z, oriented 180deg to maintain left-right offset symmetry)
        const backPieces = WallCarver.carve(w, h, t, getHolesForWall('back'));
        backPieces.forEach(p => { 
            p.rotateY(Math.PI);
            p.translate(0, 0, -d/2 + t/2); 
            walls.push(p); 
        });

        // 3. LEFT WALL (-X, carved to fit inside the front/back pillars)
        const leftPieces = WallCarver.carve(d - t*2, h, t, getHolesForWall('left')); 
        leftPieces.forEach(p => { 
            p.rotateY(-Math.PI/2); 
            p.translate(-w/2 + t/2, 0, 0); 
            walls.push(p); 
        });

        // 4. RIGHT WALL (+X)
        const rightPieces = WallCarver.carve(d - t*2, h, t, getHolesForWall('right'));
        rightPieces.forEach(p => { 
            p.rotateY(Math.PI/2); 
            p.translate(w/2 - t/2, 0, 0); 
            walls.push(p); 
        });

        return walls;
    }
}
