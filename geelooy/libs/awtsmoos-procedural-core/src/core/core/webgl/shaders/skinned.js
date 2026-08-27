
// B"H
/**
 * @file skinned.js
 * @brief High-saturation organic shader with restored skinning logic and balanced light.
 */

export const VS_SOURCE_SKINNED = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec4 aVertexColor;
    attribute vec4 aBoneIndices;
    attribute vec4 aBoneWeights;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix; 
    uniform mat4 uModelMatrix; 
    uniform mat4 uNormalMatrix;
    
    #define MAX_BONES 64
    uniform mat4 uBoneMatrices[MAX_BONES];

    varying lowp vec4 vColor;
    varying highp vec3 vNormal; 
    varying highp vec3 vWorldPos;

    void main() {
        mat4 skinMatrix = aBoneWeights.x * uBoneMatrices[int(aBoneIndices.x)] +
                          aBoneWeights.y * uBoneMatrices[int(aBoneIndices.y)] +
                          aBoneWeights.z * uBoneMatrices[int(aBoneIndices.z)] +
                          aBoneWeights.w * uBoneMatrices[int(aBoneIndices.w)];

        vec4 skinnedLocalPos = skinMatrix * aVertexPosition;

        gl_Position = uProjectionMatrix * uModelViewMatrix * skinnedLocalPos;
        vWorldPos = (uModelMatrix * skinnedLocalPos).xyz;

        vec3 localSkinnedNormal = normalize(mat3(skinMatrix) * aVertexNormal);
        vNormal = normalize(mat3(uNormalMatrix) * localSkinnedNormal);
        
        vColor = aVertexColor;
    }
`;

export const FS_SOURCE_SKINNED = `
    precision mediump float;
    
    #include <toneMapping>

    varying lowp vec4 vColor;
    varying highp vec3 vNormal;
    varying highp vec3 vWorldPos;
    
    uniform highp vec3 uAmbientLightColor; 
    uniform highp vec3 uDirectionalLightColor; 
    uniform highp vec3 uLightDirection; 
    uniform float uIsWireframe;

    void main() {
        if (uIsWireframe > 0.5) {
            gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0); 
            return;
        }

        vec3 N = normalize(vNormal);
        if (!gl_FrontFacing) N = -N;
        vec3 L = normalize(uLightDirection);

        float diff = max(dot(N, L), 0.0);
        float sss = pow(max(0.0, dot(N, -L)), 4.0) * 0.25; 
        
        // Deep Saturation Boost
        vec3 skinTint = vColor.rgb * vec3(1.1, 1.05, 1.0); 
        
        vec3 rawLight = (uAmbientLightColor * 0.7 * skinTint) + 
                        (uDirectionalLightColor * (diff + sss) * skinTint);

        float exposure = 0.9;
        vec3 tm = aces(rawLight * exposure);
        gl_FragColor = vec4(pow(tm, vec3(0.4545)), 1.0);
    }
`;
