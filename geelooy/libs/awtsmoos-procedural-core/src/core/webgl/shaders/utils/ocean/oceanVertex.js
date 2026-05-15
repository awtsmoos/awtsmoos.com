
// B"H
/**
 * @file oceanVertex.js
 * @brief Manifests the geometry of the Sea with non-uniform spectral variance.
 * 
 * THE PSALM OF THE VARIANT WAVE:
 * One wave goes East, another South-by-West,
 * In their collision, the ocean is truly blessed.
 * We shun the cold uniformity of a repeated sine,
 * Replacing it with the complexity of the Infinite Design.
 * The grid snaps to the camera, the LOD is clear,
 * Bringing the horizon far, and the ripples near.
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
        
        // Grid snapping for stable vertex noise
        float gSpace = 64.0; 
        pB.x += floor(uCameraPos.x / gSpace) * gSpace;
        pB.z += floor(uCameraPos.z / gSpace) * gSpace;

        float cDist = length(pB.xz - uCameraPos.xz);
        // Fade ocean complexity at the horizon
        float wLOD = 1.0 - smoothstep(15000.0, 45000.0, cDist);

        // B"H - REDUCED AMPLITUDE
        // Using a much smaller base scale to keep waves human-sized.
        float mS = snoise(vec3(pB.xz * 0.0005, uTime * 0.03));
        float mAmp = mix(0.15, 0.45, mS * 0.5 + 0.5) * wLOD;
        
        vec3 tg = vec3(1.0, 0.0, 0.0);
        vec3 bi = vec3(0.0, 0.0, 1.0);
        vec3 off = vec3(0.0);
        float J = 1.0; 

        // B"H - THE ASYMMETRICAL SPECTRUM
        // Varies directions and irrational lengths to break uniformity
        off += applyWave(Wave(vec2(1.0, 0.15), 0.5, 411.0), pB, tg, bi, mAmp, 0.0, J);
        off += applyWave(Wave(vec2(-0.4, 0.8), 0.45, 233.0), pB, tg, bi, mAmp * 0.9, 1.7, J);
        off += applyWave(Wave(vec2(0.7, -0.6), 0.4, 127.0), pB, tg, bi, mAmp * 0.7, 3.3, J);
        off += applyWave(Wave(vec2(-0.1, -1.0), 0.35, 67.0),  pB, tg, bi, mAmp * 0.5, 4.9, J);
        off += applyWave(Wave(vec2(0.9, 0.3),  0.2, 29.0),  pB, tg, bi, mAmp * 0.3, 6.5, J);
        
        vJacobian = J;
        vec3 oP = pB + off;
        vD = distance(uCameraPos, oP);
        
        // Earth curvature for horizon dipping
        oP.y -= pow(max(0.0, vD - 8000.0), 2.0) * 0.0000003; 
        
        vH = off.y;
        vWP = oP;
        vN = normalize(cross(bi, tg));

        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(oP, 1.0);
    }
`;
