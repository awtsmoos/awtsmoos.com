// B"H
export const VS_SOURCE_REFLECTIVE = `
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec4 aVertexColor; 

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uNormalMatrix;
    uniform mat4 uLightSpaceMatrix;

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec4 vColor;
    varying vec3 vLocalPos;
    varying highp vec4 vShadowCoord;

    const mat4 biasMat = mat4(
        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 0.5, 0.0,
        0.5, 0.5, 0.5, 1.0
    );

    void main(void) {
        vec4 worldPos = uModelMatrix * vec4(aVertexPosition, 1.0);
        vWorldPos = worldPos.xyz;
        vLocalPos = aVertexPosition; 
        vNormal = normalize(mat3(uNormalMatrix) * aVertexNormal);
        vColor = aVertexColor;
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
        
        vec3 worldNormalForShadow = normalize(mat3(uModelMatrix) * aVertexNormal);
        vec4 offsetWorldPos = vec4(worldPos.xyz + worldNormalForShadow * 0.005, 1.0);
        vShadowCoord = biasMat * uLightSpaceMatrix * offsetWorldPos;
    }
`;