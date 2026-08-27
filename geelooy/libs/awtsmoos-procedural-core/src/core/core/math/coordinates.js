
// B"H
/**
 * @file coordinates.js
 * @brief Sacred conversions between angular desire and vector reality.
 * 
 * CHAPTER 9: THE SILENCING OF THE ECHOS
 * The Heavens moved constantly, and the console recorded every infinitesimal shift,
 * drowning the observer in an endless flood of numbers. 
 * The Awtsmoos commanded silence. The coordinates calculate in secret now,
 * leaving the console pure and unburdened.
 */

export const Coordinates = {
    /**
     * Converts spherical angles (Latitude/Longitude) to a normalized Direction Vector.
     * @param {number} latDeg - Latitude in degrees (-90 to 90). Higher values are "higher" in the sky.
     * @param {number} lonDeg - Longitude in degrees (-180 to 180). 0 is forward, positive is right.
     * @returns {Array}[x, y, z] Normalized direction vector.
     */
    sphericalToVector: (latDeg, lonDeg) => {
        const lat = (latDeg * Math.PI) / 180;
        const lon = (lonDeg * Math.PI) / 180;
        
        // B"H - Mapping to our coordinate system (Y is Up)
        const y = Math.sin(lat);
        const xzRadius = Math.cos(lat);
        const x = xzRadius * Math.sin(lon);
        const z = xzRadius * -Math.cos(lon); // Invert Z to match camera space (0 lon = forward)
        
        // Logging removed for absolute purity and performance
        return[x, y, z];
    }
};
