
// B"H
/**
 * @class TerrainSeed
 * @description
 * 🌱 THE KERNEL OF THE EARTH 🌱
 * 
 * Holds the numeric values that dictate the shape of mountains and valleys.
 */
export default class TerrainSeed {
    constructor(value) {
        this.value = value || Math.random() * 10000;
    }
    
    getModifier(x, z) {
        return Math.sin(x * 0.1 + this.value) * Math.cos(z * 0.1 + this.value);
    }
}
