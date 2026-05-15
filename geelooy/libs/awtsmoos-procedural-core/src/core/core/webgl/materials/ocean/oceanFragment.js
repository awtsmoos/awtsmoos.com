
// B"H
/**
 * @file oceanFragment.js
 * @brief The Final Crucible of Light for the Ocean.
 * 
 * THE GATHERING OF THE SPARKS:
 * Here, the scattered modules unite into a single pixel of truth.
 * The physics of the surface ripple, the colors of the deep well up,
 * The specular glints strike the lens, and the foam dances on the crest.
 * Finally, the ACES curve gentles the infinite math back into human sight.
 */

export const FS_SOURCE_OCEAN = `
    #extension GL_OES_standard_derivatives : enable
    precision highp float;

    varying highp vec3 vWP;
    varying highp vec3 vN; 
    varying highp float vH;
    varying highp float vD; 
    varying highp float vJacobian;

    uniform highp vec3 uViewPos;
    uniform highp vec3 uLightDirection;
    uniform highp vec3 uDirectionalLightColor;
    uniform highp vec3 uAmbientLightColor;
    uniform highp float uSunIntensity;
    uniform highp float uTime;
    
    uniform highp vec4 uObstacles[10];      
    uniform highp int uObstacleCount;

    #include <noise>
    #include <toneMapping>
    #include <ocean_obstacles>
    #include <ocean_sky_color>
    #include <ocean_ripples>
    #include <ocean_pbr>
    #include <ocean_colors>
    #include <ocean_foam>
    
    void main() {
        // 1. SURFACE PHYSICS & VECTORS
        // Add micro-ripples to the grand geometric normal
        vec3 n = applyRipples(vN, vWP.xz, vD); 
        vec3 v = normalize(uViewPos - vWP);
        vec3 l = normalize(uLightDirection);
        vec3 r = reflect(-v, n);

        // 2. ENVIRONMENTAL MASKS (Currently neutralized to prevent black artifacts)
        float dm = 1.0, el = 0.0, pu = 1.0;
        chk_obs(vWP.xz, uObstacleCount, uObstacles, dm, el, pu);
        
        // 3. COLOR & LIGHT COMPONENT ACQUISITION
        // The deep body color with Sub-Surface Scattering
        vec3 baseColor = getOceanColor(n, l, v, vH, pu);
        // The dazzling sun glints
        vec3 specular = getSpecular(n, v, l, r);
        // The reflectivity curve based on angle
        float fresnel = getFresnel(n, v);
        // The procedural sea-lace
        vec3 foam = getFoam(vH, vJacobian, vWP.xz, vD);

        // Fetch the sky color that this specific normal would reflect
        // Using 'r' (reflection vector) for the sky color lookup
        vec3 skyReflection = getSkyColor(r) * max(uSunIntensity, 0.2);

        // 4. UNIFICATION (The final optical composite)
        // Mix the base water color with the sky reflection using the Fresnel term
        vec3 surface = mix(baseColor, skyReflection, fresnel);
        
        // Additive application of Light and Foam
        surface += specular;
        surface += foam;

        // 5. HORIZON EXTINCTION (Atmospheric Fog)
        // Smoothly blend the infinite ocean into the sky at the horizon
        float fogDistance = smoothstep(10000.0, 100000.0, vD);
        vec3 atmosphereColor = getSkyColor(normalize(vec3(v.x, 0.05, v.z)));
        vec3 finalRadiance = mix(surface, atmosphereColor, fogDistance);

        // 6. CINEMATIC TONE MAPPING
        // Funnel the HDR math safely back into the 0.0-1.0 range
        // Multiplied by 0.9 to give a slightly richer contrast
        vec3 toneMapped = aces(finalRadiance * 0.9);
        
        // Gamma correction
        gl_FragColor = vec4(pow(toneMapped, vec3(0.4545)), 1.0);
    }
`;
