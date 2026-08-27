
// B"H
export const VS_SOURCE_LAMBERT = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec4 aVertexColor;
    
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uNormalMatrix;
    
    varying vec3 vNormal;
    varying vec4 vColor;
    varying vec3 vWorldPos;
    
    void main() {
        vec4 worldPos = uModelMatrix * aVertexPosition;
        vWorldPos = worldPos.xyz;
        vNormal = normalize(mat3(uNormalMatrix) * aVertexNormal);
        vColor = aVertexColor;
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;
