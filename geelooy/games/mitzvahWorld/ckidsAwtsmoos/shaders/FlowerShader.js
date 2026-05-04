// B"H
/**
 * @file FlowerShader.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE BURST OF COLOR — PROCEDURAL FLOWER SHADER                                   ║
 * ║                                                                                  ║
 * ║  "The flowers appear on the earth..." (Shir HaShirim 2:12)                       ║
 * ║                                                                                  ║
 * ║  A pure WebGL material generating soft, translucent petals with glowing centers. ║
 * ║  No THREE import — pure GLSL + pure plain-object uniform descriptors.            ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @module FlowerShader
 */

/** @type {string} B"H: Instanced flower vertex shader with wind + player ripple */
export const FLOWER_VERTEX_SHADER = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    
    uniform float uTime;
    uniform vec3 uPlayerPos;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
        
        // Gentle wind sway (faster than grass, delicate)
        float wind = sin(worldPos.x * 2.0 + uTime * 3.0) * cos(worldPos.z * 2.0 + uTime * 2.0) * 0.1;
        worldPos.x += wind * uv.y; // sway more at top
        
        // Player interaction ripple
        vec3 pushDir = worldPos.xyz - uPlayerPos;
        float dist = length(pushDir);
        if(dist < 2.0 && dist > 0.001) {
            float push = (2.0 - dist) * 0.5;
            worldPos.xyz += normalize(pushDir) * push * uv.y;
        }

        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
`;

/** @type {string} B"H: Fragment shader — radial petal gradient with SSS glow */
export const FLOWER_FRAGMENT_SHADER = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPos;

    uniform vec3 uColorCenter;
    uniform vec3 uColorEdge;

    void main() {
        // Radial gradient from center (0.5, 0.5) to edges
        float distToCenter = distance(vUv, vec2(0.5, 0.5));
        
        // Soften edges
        float alpha = smoothstep(0.5, 0.45, distToCenter);
        if(alpha < 0.1) discard;

        // Mix colors based on radius
        vec3 finalColor = mix(uColorCenter, uColorEdge, distToCenter * 2.0);

        // Subsurface scattering fake (brighter when light hits from behind)
        float sss = dot(vNormal, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
        finalColor *= sss + 0.5;

        gl_FragColor = vec4(finalColor, alpha);
    }
`;

/**
 * @function getFlowerUniforms
 * @description
 * Returns a pure-data uniform map for the Flower shader.
 * No THREE.Color or THREE.Vector3 needed — plain {r,g,b} and {x,y,z} objects.
 *
 * @param {'rose'|'lily'|'violet'} [type='rose'] - Flower variety
 * @returns {Object} Uniform descriptor map
 */
export function getFlowerUniforms(type = 'rose') {
    // B"H: Flower color presets — all as plain channel data
    const FLOWER_PRESETS = {
        rose:   { center: { r: 1.0,  g: 1.0,  b: 0.0  }, edge: { r: 1.0,  g: 0.0,  b: 0.0  } },
        lily:   { center: { r: 1.0,  g: 1.0,  b: 0.0  }, edge: { r: 1.0,  g: 1.0,  b: 1.0  } },
        violet: { center: { r: 1.0,  g: 1.0,  b: 0.0  }, edge: { r: 0x8a / 255, g: 0x2b / 255, b: 0xe2 / 255 } }
    };

    const preset = FLOWER_PRESETS[type] || FLOWER_PRESETS.rose;

    return {
        uTime:        { value: 0 },
        uPlayerPos:   { value: { x: 0, y: 0, z: 0 } },
        uColorCenter: { value: preset.center },
        uColorEdge:   { value: preset.edge }
    };
}
