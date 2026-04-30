
/**
 * B"H
 * @module Constants
 * @description
 * High-precision measures for the Emerald Void. 
 * By increasing the spatial frequency, we ensure the divine patterns remain 
 * sharp and defined even when the observer draws near to the earth.
 */
export default {
    COLORS: {
        dark: "vec3(0.005, 0.10, 0.005)",
        bright: "vec3(0.12, 0.52, 0.08)",
        earth: "vec3(0.35, 0.32, 0.18)"
    },
    SCALES: {
        // B"H: Higher frequency = less blur when zoomed in
        noise: 1.25, 
        patchy: 8.5,
        wind: 0.8
    }
};
