
// B"H
/**
 * @file shadow.js
 * @brief Shaders for the divine concealment (Tzimtzum).
 * 
 * In the Seder Hishtalshelus of rendering, the Shadow Map pass creates a 
 * boundary of absence. 
 * 
 * THE POEM OF THE FRAGMENT:
 * The Depth is the Truth, the distance revealed,
 * Yet the Framebuffer cries for the Color concealed.
 * Though the shadow is void, and the darkness is vast,
 * We must write to the buffer, or the die is not cast.
 */

export const VS_SOURCE_SHADOW = `
    attribute vec4 aVertexPosition;
    attribute vec4 aBoneIndices;
    attribute vec4 aBoneWeights;

    uniform highp mat4 uLightSpaceMatrix; 
    uniform highp mat4 uModelMatrix; 
    
    #define MAX_BONES 64
    uniform mat4 uBoneMatrices[MAX_BONES];
    uniform float uUseSkinning;

    void main(void) {
        vec4 pos = aVertexPosition;
        
        if (uUseSkinning > 0.5) {
            mat4 skinMatrix = aBoneWeights.x * uBoneMatrices[int(aBoneIndices.x)] +
                              aBoneWeights.y * uBoneMatrices[int(aBoneIndices.y)] +
                              aBoneWeights.z * uBoneMatrices[int(aBoneIndices.z)] +
                              aBoneWeights.w * uBoneMatrices[int(aBoneIndices.w)];
            pos = skinMatrix * aVertexPosition;
        }

        gl_Position = uLightSpaceMatrix * uModelMatrix * pos;
    }
`;

export const FS_SOURCE_SHADOW = `
    precision mediump float;
    void main(void) {
        // B"H - Though only depth is recorded in the depth attachment,
        // since we have an active COLOR_ATTACHMENT0 for mobile compatibility,
        // we must output a value to avoid WebGL state errors.
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;
