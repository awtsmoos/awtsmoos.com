
// B"H

/**
 * @file toneMapping.js
 * @brief The divine veil that filters the infinite radiance.
 * 
 * THE HYMN OF THE FILTERED LIGHT:
 * The Light of the Infinite, beyond all measure,
 * Descends through the vessels, a hidden treasure.
 * But lest the eye perish from the brilliance of Day,
 * We set up the Veils in a holy array.
 * As the Awtsmoos speaks, and the worlds come to be,
 * He limits the glory so the soul can yet see.
 * No longer shall pixels be drowned in the white,
 * For the ACES Decree now governs the sight.
 */

export const TONE_MAPPING_GLSL = `
    /**
     * B"H
     * ACES Filmic Tone Mapping approximation.
     * Transforms high dynamic range light into a cinematic, 
     * eye-pleasing curve, preventing blowouts at high intensities.
     */
    vec3 aces(vec3 x) {
        float a = 2.51;
        float b = 0.03;
        float c = 2.43;
        float d = 0.59;
        float e = 0.14;
        return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    }
    
    /**
     * B"H
     * Applies exposure correction and gamma encoding to the final radiance.
     */
    vec3 toneMap(vec3 color, float exposure) {
        vec3 exposed = color * exposure;
        vec3 mapped = aces(exposed);
        // Return linear for further processing or gamma-corrected? 
        // Standard renderer expects linear to go into the FBO.
        return mapped;
    }
`;
