// B"H
/**
 * @module SpiritualWeaponManifestor
 * @description THE CRAFTING OF SPIRITUAL ARMS
 * A data-driven system that translates JSON weapon definitions into 
 * physical manifestations of light and power.
 */

export const SPIRITUAL_WEAPON_VISUALS = {
    sword: {
        shape: "DoubleEdgedBlade",
        material: { AwtsmoosEnergyMaterial: { color: "#ffd700", pulseSpeed: 2.0 } },
        animation: "Slash",
        scale: [1, 5, 0.2]
    },
    bow: {
        shape: "CelestialArc",
        material: { AwtsmoosLuminousMaterial: { color: "#9c27b0", glowIntensity: 1.5 } },
        animation: "NockAndFire",
        scale: [2, 2, 0.5]
    }
};

/**
 * @class SpiritualWeaponManifestor
 * @description Compiles the JSON data into actionable 3D vessel instructions.
 */
export default class SpiritualWeaponManifestor {
    /**
     * @method compileVisuals
     * @param {string} weaponType - 'sword' | 'bow'
     * @returns {Object} Golem configuration for generateThreeJsMesh
     */
    static compileVisuals(weaponType, customColor) {
        const data = SPIRITUAL_WEAPON_VISUALS[weaponType] || SPIRITUAL_WEAPON_VISUALS.sword;
        
        return {
            guf: { 
                // These geometry names must exist in GeometryManager
                [data.shape]: data.scale 
            },
            toyr: {
                // Merge default material with custom color
                [Object.keys(data.material)[0]]: {
                    ...data.material[Object.keys(data.material)[0]],
                    color: customColor || data.material[Object.keys(data.material)[0]].color
                }
            },
            animation: data.animation
        };
    }
}
