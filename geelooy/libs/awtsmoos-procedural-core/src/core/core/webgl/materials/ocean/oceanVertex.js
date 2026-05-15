
// B"H
/**
 * @file oceanVertex.js
 * @brief The Vertex Shader of the Infinite Ocean.
 */

export const VS_SOURCE_OCEAN = `
    attribute vec3 aVertexPosition; 
    
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;
    uniform highp vec3 uCameraPos;
    uniform highp float uTime;
    
    varying highp vec3 vWP;
    varying highp vec3 vN;
    varying highp float vH;
    varying highp float vJacobian; 
    varying highp float vD; 

    #include <noise>
    #include <ocean_gerstner>
    
    void main() {
        vec3 pB = aVertexPosition;
        
        float gSpace = 133.3333; 
        pB.x += floor(uCameraPos.x / gSpace) * gSpace;
        pB.z += floor(uCameraPos.z / gSpace) * gSpace;

        float cDist = length(pB.xz - uCameraPos.xz);
        float wLOD = 1.0 - smoothstep(15000.0, 35000.0, cDist);

        float eS = snoise(vec3(pB.xz * 0.002, uTime * 0.02));
        float pS = snoise(vec3(pB.xz * 0.008, uTime * 0.05));
        
        float mAmp = mix(0.4, 1.8, smoothstep(-0.8, 0.8, eS)) * wLOD;
        
        vec3 tg = vec3(1.0, 0.0, 0.0);
        vec3 bi = vec3(0.0, 0.0, 1.0);
        vec3 off = vec3(0.0);
        float J = 1.0; 

        // B"H - MASSIVE SWELL MULTIPLIER
        // By multiplying mAmp by a significant factor (e.g. 5.0), 
        // we create true, gigantic ocean displacement.
        float heavyAmp = mAmp * 5.0;

        off += applyWave(Wave(vec2(1.0, 0.4), 0.35, 400.0), pB, tg, bi, heavyAmp, pS * 0.8, J);
        off += applyWave(Wave(vec2(0.7, 0.8), 0.30, 200.0), pB, tg, bi, heavyAmp * 0.8, pS * 1.2, J);
        off += applyWave(Wave(vec2(-0.3, 1.0), 0.25, 100.0), pB, tg, bi, heavyAmp * 0.6, pS * 1.6, J);
        off += applyWave(Wave(vec2(0.5, -0.6), 0.20, 50.0),  pB, tg, bi, heavyAmp * 0.4, pS * 2.0, J);
        off += applyWave(Wave(vec2(0.9, -0.1), 0.15, 25.0),  pB, tg, bi, heavyAmp * 0.3, pS * 2.5, J);
        off += applyWave(Wave(vec2(-0.8, 0.6), 0.10, 12.0),  pB, tg, bi, heavyAmp * 0.15, pS * 3.0, J);
        
        vJacobian = J;

        vec3 oP = pB + off;
        
        vD = distance(uCameraPos, oP);
        oP.y -= pow(max(0.0, vD), 2.0) * 0.0000002; 
        
        vH = off.y;
        vWP = oP;
        
        vec3 trueNormal = normalize(cross(bi, tg));
        vN = mix(vec3(0.0, 1.0, 0.0), trueNormal, wLOD);

        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(oP, 1.0);
    }
`;
