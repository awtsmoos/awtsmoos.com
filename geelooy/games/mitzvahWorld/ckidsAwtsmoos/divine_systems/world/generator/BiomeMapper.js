
// B"H
/**
 * @class BiomeMapper
 * @description
 * 🗺️ THE DIVIDER OF THE LANDS 🗺️
 */
export default class BiomeMapper {
    static getBiome(elevation, moisture) {
        if (elevation < -5) return "OCEAN";
        if (elevation < 0) return "BEACH";
        if (elevation > 20) return "MOUNTAIN";
        
        if (moisture > 0.5) return "FOREST";
        if (moisture < -0.5) return "DESERT";
        return "PLAINS";
    }
}
