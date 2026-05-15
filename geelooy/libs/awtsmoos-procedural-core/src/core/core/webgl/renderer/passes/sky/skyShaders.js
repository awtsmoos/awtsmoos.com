
// B"H
/**
 * @file skyShaders.js
 * @brief Firms the Firmament with high-resolution phased moon and atmospheric scattering.
 */

export const VS_SKY = `
    attribute vec2 aVertexPosition; 
    varying vec2 vUv;
    void main() {
        vUv = aVertexPosition * 0.5 + 0.5;
        gl_Position = vec4(aVertexPosition, 1.0, 1.0); 
    }
`;

export const FS_SKY = `
    precision highp float;
    varying vec2 vUv;

    uniform mat4 uInvProj;
    uniform mat4 uInvView;
    uniform vec3 uSunDir;
    uniform vec3 uMoonDir;
    uniform float uCloudDensity;
    uniform float uTime;
    uniform vec3 uCameraPos;

    #include <noise>
    #include <toneMapping>
    
    void main() {
        vec4 viewPos = uInvProj * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
        vec3 V = normalize((uInvView * vec4(viewPos.xy, -1.0, 0.0)).xyz);
        
        float sunH = uSunDir.y;

        // 1. SKY ATMOSPHERE
        vec3 dZenith = vec3(0.1, 0.4, 0.8), dHorizon = vec3(0.5, 0.8, 1.1);
        vec3 sZenith = vec3(0.12, 0.1, 0.3), sHorizon = vec3(1.3, 0.5, 0.2);
        vec3 voidNight = vec3(0.005, 0.006, 0.015);

        float dayFactor = smoothstep(-0.25, 0.35, sunH);
        float sunsetMix = smoothstep(0.4, -0.2, sunH) * dayFactor;
        
        vec3 baseSky = mix(voidNight, mix(dHorizon, sHorizon, sunsetMix), dayFactor);
        vec3 zenithSky = mix(voidNight, mix(dZenith, sZenith, sunsetMix), dayFactor);
        vec3 sky = mix(baseSky, zenithSky, pow(max(0.0, V.y), 0.5));

        // 2. PERFECT PHASED MOON
        vec3 nMoon = normalize(uMoonDir);
        float mDist = dot(V, nMoon);
        float moonRadius = 0.00075; 
        
        if (mDist > 1.0 - moonRadius) {
            vec3 localPos = normalize(V - nMoon);
            float mask = smoothstep(1.0 - moonRadius - 0.00003, 1.0 - moonRadius, mDist);
            
            vec3 sunNorm = normalize(uSunDir);
            float phase = dot(localPos + nMoon, sunNorm);
              
            float shadowLimit = -0.15; 
            float brightness = smoothstep(shadowLimit, 0.3, phase);
            
            vec3 moonCol = vec3(0.9, 0.95, 1.0) * (0.2 + 0.8 * brightness);
            sky = mix(sky, moonCol, mask);
        }

        // 3. BLOOM AND FOG
        float sunDist = max(0.0, dot(V, normalize(uSunDir)));
        sky += vec3(1.0, 0.9, 0.7) * pow(sunDist, 1024.0) * dayFactor;

        // B"H - Calibrate Infinite Radiance back to Perceptible Colors
        vec3 tm = aces(sky * 0.9);
        gl_FragColor = vec4(pow(tm, vec3(0.4545)), 1.0);
    }
`;
