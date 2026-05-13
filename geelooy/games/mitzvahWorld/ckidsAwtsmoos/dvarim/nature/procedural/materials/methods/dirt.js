/**
 * B"H
 * @file dirt.js
 * @description
 * 🟤 THE EARTH OF HUMILITY 🟤
 * 
 * Chapter 40: The Path of the Feet.
 * "And his feet shall stand in that day" (Zecharya 14:4).
 * 
 * A procedural dirt texture with fractal noise and earth tones.
 */

export default async function dirt(olam, type) {
    return {
        type: 'Standard',
        properties: {
            color: 0x4e342e,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: false
        },
        snippets: {
            onBeforeCompile: `
                // B"H: Procedural Dirt Noise
                float noise(vec3 p) {
                    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
                }
                
                void main() {
                    // Inject dirt detail
                    vec3 p = vWorldPosition * 2.0;
                    float n = noise(floor(p));
                    gl_FragColor.rgb *= (0.8 + 0.2 * n);
                }
            `
        }
    };
}
