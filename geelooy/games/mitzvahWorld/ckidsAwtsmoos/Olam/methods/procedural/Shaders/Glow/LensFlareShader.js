
/**
 * B"H
 * @module LensFlareShader
 * @description
 * Chapter 7: The Blindness of Glory
 * "The sun shall no longer be your light by day... for the Lord will be your everlasting light." (Yeshayahu 60:19)
 * This shader represents the unyielding intensity of the source of all light. 
 * By using raw WebGL logic, we create crepuscular rays, chromatic aberrations, 
 * and internal hexagonal lens reflections entirely from mathematical data.
 */
export default class LensFlareShader {
    /**
     * @function getVertex
     */
    static getVertex() {
        return `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `;
    }

    /**
     * @function getFragment
     * @description Intense procedural lens flare logic.
     */
    static getFragment() {
        return `
            varying vec2 vUv;
            uniform vec3 sunPos; // Screen space sun position
            uniform float intensity;
            uniform float time;

            float hash(float n) { return fract(sin(n) * 43758.5453); }

            float noise(vec2 x) {
                vec2 i = floor(x);
                vec2 f = fract(x);
                f = f * f * (3.0 - 2.0 * f);
                float n = i.x + i.y * 57.0;
                return mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                           mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
            }

            void main() {
                vec2 p = vUv - 0.5;
                vec2 s = sunPos.xy - 0.5;
                
                // 1. THE CORE: The Blinding Void
                float dist = length(p - s);
                float core = exp(-dist * 20.0) * 2.0;
                
                // 2. RAY BURSTS: Crepuscular emanations
                float angle = atan(p.y - s.y, p.x - s.x);
                float rays = 0.0;
                for(int i = 0; i < 8; i++) {
                    float fi = float(i);
                    rays += pow(abs(cos(angle * (fi + 1.0) + time * 0.5)), 200.0) * (1.0 / (fi + 1.0));
                }
                rays *= exp(-dist * 5.0);

                // 3. INTERNAL GHOSTING: Lens reflections
                vec3 ghosts = vec3(0.0);
                vec2 offset = s - p;
                for(int i = 1; i < 6; i++) {
                    float fi = float(i);
                    vec2 gPos = s + offset * (fi * 0.4);
                    float gDist = length(p - gPos);
                    float gSize = 0.02 * fi;
                    float ghost = smoothstep(gSize, 0.0, gDist);
                    
                    // Chromatic shift per ghost
                    ghosts.r += ghost * (1.0 - fi * 0.1);
                    ghosts.g += ghost * (fi * 0.1);
                    ghosts.b += ghost * abs(sin(fi));
                }

                vec3 color = vec3(1.0, 0.9, 0.7) * core;
                color += vec3(1.0, 0.95, 0.8) * rays;
                color += ghosts * 0.1;

                gl_FragColor = vec4(color * intensity, 1.0);
            }
        `;
    }
}
