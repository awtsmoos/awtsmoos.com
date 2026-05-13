/**
 * B"H
 * @file leaf.js
 * @module LeafMaterialGenerator
 * @description THE RADIANCE OF THE BRANCH — Super-Realistic Leaf Material
 */

export default async function createLeaf(olam) {
    return {
        type: 'Standard',
        properties: { 
            color: 0x2e7d32, // Deep Forest Green
            roughness: 0.8,
            metalness: 0.0,
            side: 2, // DoubleSide
            transparent: true,
            alphaTest: 0.5
        },
        snippets: {
            onBeforeCompile: `
                // B"H: Super-Realistic Leaf Shader
                varying vec2 vUv;
                varying vec3 vWorldPos;
                
                void main() {
                    // 1. Organic Teardrop Shape via UV manipulation
                    vec2 centeredUv = vUv - 0.5;
                    float bend = sin(centeredUv.x * 3.14) * 0.2;
                    vec2 shapedUv = vec2(centeredUv.x, centeredUv.y + bend);
                    float r = length(shapedUv) * (1.2 + 0.5 * abs(sin(atan(shapedUv.y, shapedUv.x))));
                    float leafShape = smoothstep(0.45, 0.4, r);
                    if(leafShape < 0.1) discard;

                    // 2. Intricate Vein Network
                    float primaryVein = smoothstep(0.02, 0.0, abs(shapedUv.y)) * smoothstep(0.5, -0.2, shapedUv.x);
                    float branchFreq = 25.0;
                    float secondaryVeins = abs(sin(shapedUv.x * branchFreq + abs(shapedUv.y) * branchFreq * 1.5));
                    secondaryVeins = smoothstep(0.88, 0.98, secondaryVeins) * 0.4;
                    float totalVeins = max(primaryVein * 0.7, secondaryVeins);

                    // 3. Synthesis
                    vec3 baseColor = gl_FragColor.rgb;
                    vec3 veinColor = baseColor * 0.4;
                    gl_FragColor.rgb = mix(baseColor, veinColor, totalVeins);
                    
                    // 4. Rim Highlight
                    float rim = smoothstep(0.38, 0.48, r);
                    gl_FragColor.rgb += vec3(0.2, 0.4, 0.1) * rim;
                    
                    gl_FragColor.a = leafShape;
                }
            `
        }
    };
}
