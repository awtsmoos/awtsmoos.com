
// B"H
export const VS_FLARE = `
    attribute vec2 aVertexPosition;
    varying vec2 vUv;
    void main() {
        vUv = aVertexPosition * 0.5 + 0.5;
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
`;

export const FS_FLARE = `
    precision highp float;
    varying vec2 vUv;

    uniform vec3 uSunScreenPos; 
    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec3 uSunDir; 
    uniform float uSunIntensity;

    float sdHexagon(vec2 p, float r) {
        const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
        p = abs(p);
        p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
        p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
        return length(p) * sign(p.y);
    }

    void main() {
        if (uSunScreenPos.z < 0.5 || uSunDir.y < -0.05) discard;

        float sunFade = smoothstep(-0.05, 0.1, uSunDir.y);

        vec2 sun = uSunScreenPos.xy;
        vec2 uv = vUv;
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        
        vec2 dir = (uv - sun) * aspect;
        float d = length(dir);
        
        vec3 finalColor = vec3(0.0);

        float core = 1.0 - smoothstep(0.0, 0.015, d);
        float glow = exp(-d * 6.0) * 0.8; 
        finalColor += vec3(1.0, 0.95, 0.8) * (core + glow);

        float streakCore = exp(-pow(dir.y * 150.0, 2.0)) * exp(-pow(dir.x * 0.8, 2.0));
        float streakWide = exp(-pow(dir.y * 400.0, 2.0)) * exp(-pow(dir.x * 0.2, 2.0));
        vec3 streakColor = vec3(0.2, 0.6, 1.0); 
        finalColor += streakColor * (streakCore * 0.7 + streakWide * 0.4);

        vec2 center = vec2(0.5);
        vec2 ghostVec = (center - sun); 
        
        for (int i = 1; i <= 5; i++) {
            float f = float(i) * 0.7; 
            vec2 ghostPos = sun + ghostVec * f;
            vec2 gDir = (uv - ghostPos) * aspect;
            float scale = 30.0 / float(i);
            
            float hexDist = sdHexagon(gDir * scale, 1.0);
            float r = 1.0 - smoothstep(-0.01, 0.02, sdHexagon(gDir * scale * 0.95, 1.0));
            float g = 1.0 - smoothstep(-0.01, 0.02, hexDist);
            float b = 1.0 - smoothstep(-0.01, 0.02, sdHexagon(gDir * scale * 1.05, 1.0));
            
            vec3 ghostCol = vec3(r, g, b) * (0.04 / float(i));
            float edgeIntensity = smoothstep(0.0, 0.7, length(center - sun));
            finalColor += ghostCol * (1.0 + edgeIntensity * 2.0);
        }

        float angle = atan(dir.y, dir.x);
        float star = 0.0;
        star += pow(max(0.0, 1.0 - d * 1.5), 6.0) * abs(cos(angle * 2.0 + uTime * 0.1));
        finalColor += vec3(1.0, 0.8, 0.6) * star * 0.4;

        float vignette = 1.0 - smoothstep(0.5, 1.0, length(uv - 0.5));
        finalColor *= vignette;

        gl_FragColor = vec4(finalColor * sunFade * uSunIntensity, 1.0);
    }
`;
