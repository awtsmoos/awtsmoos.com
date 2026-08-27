
// B"H
/**
 * @file sand.js
 * @brief An intensely detailed, multi-scale procedural sand generator.
 * 
 * THE POEM OF THE SHIFTING GRAINS:
 * The earth is not flat, nor is it a painted sheet,
 * It is a tapestry of dunes where the wind and water meet.
 * We carve the macro waves with the geometry of sine,
 * And scatter a million sparks where the quartz crystals shine.
 * From the great swelling dune to the microscopic grain,
 * The footprint of the Awtsmoos shall ever remain.
 */

import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_SAND = `
    #extension GL_OES_standard_derivatives : enable
    precision highp float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}

    /**
     * @brief Generates the complex topography of the sand.
     */
    float fetchHeights(vec2 uv) {
        // 1. Macro Dunes (Large, sweeping curves)
        // Domain warping to make the dunes flow organically
        vec2 warp = vec2(fbm(uv * 2.0), fbm(uv * 2.0 + vec2(10.0)));
        float dunes = sin(uv.x * 25.0 + warp.x * 5.0 + uv.y * 5.0) * 0.5 + 0.5;
        // Sharpen the dune ridges slightly
        dunes = pow(dunes, 1.5) * 0.6;
        
        // 2. Micro Wind-Ripples (High frequency, perpendicular-ish to dunes)
        float ripples = sin(uv.x * 300.0 - uv.y * 150.0 + noise(uv * 50.0) * 4.0) * 0.5 + 0.5;
        ripples = pow(ripples, 2.0) * 0.08;

        // 3. Cellular Grain / Pebbles
        float pd = cellular(uv * 300.0);
        float grain = (1.0 - smoothstep(0.0, 0.3, pd)) * 0.03;

        return dunes + ripples + grain;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        
        // Calculate true height
        float h = fetchHeights(uv);
        
        // Calculate Analytical Normal via finite difference
        vec2 e = vec2(2.0 / uResolution.x, 0.0);
        float hx = fetchHeights(uv + e.xy) - fetchHeights(uv - e.xy);
        float hy = fetchHeights(uv + e.yx) - fetchHeights(uv - e.yx);
        // The Z component multiplier controls the bump strength
        vec3 normal = normalize(vec3(-hx * 8.0, -hy * 8.0, 1.0));
        
        // --- THE COLOR OF THE EARTH ---
        // Rich, warm tones for realistic sun-kissed sand
        vec3 colorShadow = vec3(0.55, 0.45, 0.30);
        vec3 colorPeak   = vec3(0.92, 0.86, 0.75);
        vec3 colorGrain  = vec3(1.0, 0.98, 0.95);
        
        // Base color mixed by dune height
        vec3 albedo = mix(colorShadow, colorPeak, smoothstep(0.1, 0.6, h));
        
        // Add random light grains scattered across the surface
        float grainNoise = hash(floor(uv * 1024.0).x + floor(uv * 1024.0).y * 57.0);
        if (grainNoise > 0.85) {
            albedo = mix(albedo, colorGrain, (grainNoise - 0.85) * 6.0);
        }

        // --- PRE-BAKED LIGHTING ---
        // We establish a strong directional light to bake shadows directly into the texture
        vec3 lDir = normalize(vec3(0.6, 0.7, 0.4));
        vec3 vDir = normalize(vec3(0.0, 0.5, 1.0)); // Approximated view
        vec3 hVec = normalize(lDir + vDir);

        // Diffuse
        float diff = max(dot(normal, lDir), 0.0);
        
        // Micro-Glints (Quartz crystals sparkling in the sun)
        float glintMask = pow(grainNoise, 10.0); // Extremely sparse
        float spec = pow(max(dot(normal, hVec), 0.0), 128.0) * 15.0; // Very sharp and bright
        float glints = glintMask * spec;

        // Ambient Occlusion in the deep ripple crevices
        float ao = smoothstep(0.0, 0.4, h);

        vec3 finalColor = albedo * (0.2 + diff * 0.8) * ao + vec3(glints);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;
