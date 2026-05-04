// B"H
/**
 * @module roadNetwork
 * @description THE ARTERIES OF THE VILLAGE — The Veins of the Emerald World.
 * These paths are the conduits of the Divine Flow, connecting every soul (property) 
 * to the central Source (the Great Etz Chayim).
 * 
 * "The path of the righteous is like the shining light..." (Proverbs 4:18)
 */

/**
 * @class RoadGenerator
 * @description A master manifestation of the Awtsmoos used to pave the paths of reality.
 */
class RoadGenerator {
    /**
     * @function generate
     * @description B"H - Creates a massive network of roads connecting properties and creating loops.
     * @param {Array} properties - The list of manifested property layouts.
     * @returns {Array} The compiled list of road segments.
     */
    static generate(properties) {
        // B"H: silent

        const roads = [];
        
        // ═══ 1. THE MAIN ARTERY (EMERALD AVENUE) ═══
        roads.push({
            id: "main_avenue",
            name: "Emerald_Avenue",
            points: [[-300, 0], [-150, 0], [0, 0], [150, 0], [300, 0]],
            width: 12, sidewalkWidth: 3, sidewalkHeight: 0.4, isSolid: true
        });

        // ═══ 2. THE TRANSVERSE ARTERY (SIMCHA STREET) ═══
        roads.push({
            id: "transverse_artery",
            name: "Simcha_Street",
            points: [[0, -300], [0, -150], [0, 0], [0, 150], [0, 300]],
            width: 10, sidewalkWidth: 2.5, sidewalkHeight: 0.35, isSolid: true
        });

        // ═══ 3. PROCEDURAL SPURS ═══
        // Connect each property to the nearest main artery
        properties.forEach((prop, idx) => {
            const { x, z } = prop.center;
            const roadId = `road_to_${prop.id}`;
            
            // Determine if closer to X artery or Z artery
            const distToX = Math.abs(z);
            const distToZ = Math.abs(x);
            
            let points = [];
            if (distToX < distToZ) {
                // Connect to Emerald Avenue (y=0 in 2D grid logic, which is Z=0 in 3D)
                points = [[x, 0], [x, z * 0.5], [x, z]];
            } else {
                // Connect to Simcha Street (x=0 in 2D grid logic)
                points = [[0, z], [x * 0.5, z], [x, z]];
            }

            roads.push({
                id: roadId,
                name: `${prop.name}_Lane`,
                points: points,
                width: 6, sidewalkWidth: 1.5, sidewalkHeight: 0.2, isSolid: true
            });
        });

        // ═══ 4. THE OUTER RING (SEFIROT LOOP) ═══
        const ringRadius = 400;
        const ringPoints = [];
        const segments = 12;
        for (let i = 0; i <= segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            ringPoints.push([Math.cos(a) * ringRadius, Math.sin(a) * ringRadius]);
        }
        roads.push({
            id: "outer_ring",
            name: "Sefirot_Loop",
            points: ringPoints,
            width: 8, sidewalkWidth: 2, sidewalkHeight: 0.3, isSolid: true
        });

        return roads;
    }
}

export const ROAD_NETWORK = RoadGenerator;

