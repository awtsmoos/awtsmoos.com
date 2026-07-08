// B"H
/**
 * @module DoorwayTrimBuilder
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE GLORY OF THE GATES — Pure Data Trim Generation        ║
 * ║                                                             ║
 * ║  "Lift up your heads, O gates! And be lifted up,            ║
 * ║  O ancient doors, that the King of glory may come in."      ║
 * ║  (Tehillim 24:7)                                            ║
 * ║                                                             ║
 * ║  Generates beautiful frames, lintels, and pillars around    ║
 * ║  each entrance. Emits pure JSON instructions.               ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import ENTRANCE_POSITIONS from './data/EntrancePositionMap.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class DoorwayTrimBuilder {
    static build(blueprint) {
        const entrances = blueprint.entrances || [];
        const instructions = [];

        entrances.forEach(ent => {
            const w = ent.width || 4;
            const h = ent.height || 5.5;
            const t = blueprint.wallThickness || 1;
            const trimThickness = 0.4;
            const trimWidth = 0.6;
            
            const posFn = ENTRANCE_POSITIONS[ent.wall];
            if (!posFn) return;
            
            // We use the hinge data to find the center of the doorway
            // The hinge is at the RIGHT edge of the doorway (from enterer perspective)
            // So the center is offset by half the doorway width to the left
            const hingeData = posFn(ent, blueprint);
            
            // To properly orient the trim, we'll build it at origin, 
            // shift it to the doorway center, then apply the rotation and position
            
            const localMods = (dx, dy, dz) => [
                { type: 'translate', x: dx, y: dy, z: dz },
                { type: 'rotateY', angle: hingeData.rotY },
                { type: 'translate', x: hingeData.hx, y: hingeData.hy, z: hingeData.hz }
            ];

            // 1. Left Pillar (from enterer perspective, so on the +X side of hinge local space since hinge is on right)
            // Actually hinge is at origin, X points left from the hinge.
            // Wait, hinge is at +X edge (width/2) in wall-local space in EntrancePositionMap.
            // Let's use the same logic as EntrancePositionMap but target the pillars.
            
            const pW = trimWidth * 0.9;
            // Left pillar (from enterer perspective)
            instructions.push({
                type: 'box',
                params: { width: pW, height: h, depth: t + trimThickness * 2.2 },
                modifiers: localMods(-w - pW/2, h/2, 0),
                materialGroup: 1 // Wood/Trim material
            });

            // Right pillar (at the hinge side)
            instructions.push({
                type: 'box',
                params: { width: pW, height: h, depth: t + trimThickness * 2.2 },
                modifiers: localMods(pW/2, h/2, 0),
                materialGroup: 1
            });

            // 3. Top Lintel Beam (The Crown)
            const lintelBeamH = 0.6; // B"H: A slim, elegant beam
            const lintelBeamW = w + (pW * 2);
            
            instructions.push({
                type: 'box',
                params: { width: lintelBeamW, height: lintelBeamH, depth: t + trimThickness * 2.4 },
                modifiers: localMods(-w/2, h + lintelBeamH/2, 0),
                materialGroup: 1
            });

            // 4. THE MEZUZAH — Guarding the Gate of Yisroel
            // Positioned on the inner face (jamb) of the right doorpost
            const mezW = 0.15; // Depth sticking out from the jamb
            const mezH = 0.8;  // Height
            const mezD = 0.2;  // Width across the jamb face
            const mezY = h * 0.7; // Top third
            
            instructions.push({
                type: 'box',
                params: { width: mezW, height: mezH, depth: mezD },
                modifiers: [
                    { type: 'rotateY', angle: -Math.PI / 2 }, // Face towards the left pillar
                    { type: 'rotateX', angle: 0.15 }, // Holy tilt forward
                    ...localMods(mezD / 2, mezY, 0) // Center on the jamb face
                ],
                materialGroup: 1
            });
            
            // (Cylinder removed as requested by the soul of the user)
        });

        return instructions;
    }
}
