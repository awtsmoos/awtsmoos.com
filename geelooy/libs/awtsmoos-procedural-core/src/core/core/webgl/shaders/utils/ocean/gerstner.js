
// B"H
/**
 * @file gerstner.js
 * @brief The Refined Trochoidal Wave Engine.
 * 
 * THE HYMN OF THE CONTROLLED DEEP:
 * The Mayim (Waters) are powerful, yet they are bound by the Word.
 * We set a limit to the swell, lest the dry land be obscured.
 * Through the wavenumber k, and the steepness of the crest,
 * We find the balance of motion, where the eye can truly rest.
 * Not a wall of ice, but a ripple of grace,
 * Reflecting the light of the Sun upon the Golem's face.
 */

export const VS_OCEAN_GERSTNER = `
struct Wave { 
    vec2 dir;   
    float steep;
    float len;  
};

/**
 * @function applyWave
 * @brief Summons a single stable Gerstner wave component with capped verticality.
 */
vec3 applyWave(Wave w, vec3 p, inout vec3 t, inout vec3 b, float globalAmp, float noise, inout float J) {
    float k = 6.28318 / w.len;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(w.dir);
    
    // Phase integration
    float f = k * (dot(d, p.xz) - c * uTime) + noise;
    
    // B"H - REFINED AMPLITUDE SCALING
    // We scale the amplitude by the wavelength to ensure high-frequency ripples 
    // don't try to be as tall as grand swells.
    float a = globalAmp * (w.len * 0.015); 
    
    // Michell's Limit enforcement: Q * k * A <= 1.0
    float q = w.steep / (k * a + 0.001); 
    // Cap Q to prevent self-intersection even at high intensities
    q = min(q, 1.0 / (k * a + 0.1));

    float cosF = cos(f);
    float sinF = sin(f);

    float wa = k * a;
    
    // Tangent/Binormal accumulation for Normal mapping
    t += vec3(
        -d.x * d.x * (q * wa * sinF),
        d.x * (wa * cosF),
        -d.x * d.y * (q * wa * sinF)
    );
    b += vec3(
        -d.x * d.y * (q * wa * sinF),
        d.y * (wa * cosF),
        -d.y * d.y * (q * wa * sinF)
    );

    // Partial Jacobian for foam tracing
    J -= q * wa * cosF;

    return vec3(
        q * a * d.x * cosF,
        a * sinF,
        q * a * d.y * cosF
    );
}
`;
