
// B"H
/**
 * @file noise.js
 * @brief Advanced GLSL noise library for procedural creation.
 */
export const NOISE_GLSL = `
    // --- Hash Functions ---
    float hash(float n) { return fract(sin(n) * 43758.5453123); }
    
    vec2 hash2(vec2 p) {
        p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
        return fract(sin(p)*43758.5453);
    }
    
    vec3 hash3(vec3 p) {
        p = vec3(dot(p,vec3(127.1,311.7, 74.7)),
                 dot(p,vec3(269.5,183.3,246.1)),
                 dot(p,vec3(113.5,271.9,124.6)));
        return fract(sin(p)*43758.5453);
    }

    // --- Value Noise (Smooth) ---
    float noise(vec2 x) {
        vec2 p = floor(x);
        vec2 f = fract(x);
        f = f*f*(3.0-2.0*f);
        float n = p.x + p.y*57.0;
        return mix(mix(hash(n+0.0), hash(n+1.0),f.x),
                   mix(hash(n+57.0), hash(n+58.0),f.x),f.y);
    }

    // --- Gradient Noise (Perlin-ish) ---
    float gnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                       dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
                   mix(dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                       dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
    }

    // --- Fractal Brownian Motion (FBM) ---
    float fbm(vec2 x) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < 5; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }
    
    // High-Freq FBM for grain
    float fbmHigh(vec2 x) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 3; ++i) {
            v += a * noise(x);
            x = x * 2.0;
            a *= 0.5;
        }
        return v;
    }

    // --- Voronoi / Cellular Noise ---
    // Returns vec2(minDist, 2ndMinDist) for edge detection
    vec2 voronoi(vec2 x) {
        vec2 n = floor(x);
        vec2 f = fract(x);
        vec2 res = vec2(8.0);
        
        for(int j=-1; j<=1; j++)
        for(int i=-1; i<=1; i++) {
            vec2 b = vec2(float(i), float(j));
            vec2 r = vec2(b) - f + hash2(n + b);
            float d = dot(r,r);
            
            if(d < res.x) {
                res.y = res.x;
                res.x = d;
            } else if(d < res.y) {
                res.y = d;
            }
        }
        return vec2(sqrt(res.x), sqrt(res.y));
    }

    // Wrapper for standard cellular noise (F1 distance)
    float cellular(vec2 p) {
        return voronoi(p).x;
    }
`;
