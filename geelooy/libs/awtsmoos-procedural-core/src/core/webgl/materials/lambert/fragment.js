
// B"H
export const FS_SOURCE_LAMBERT = `
    precision mediump float;
    
    varying vec3 vNormal;
    varying vec4 vColor;
    varying vec3 vWorldPos;
    
    uniform vec3 uBaseColor;
    uniform vec3 uAmbientLightColor;
    uniform vec3 uDirectionalLightColor;
    uniform vec3 uLightDirection;
    
    uniform sampler2D uAlbedoMap;
    uniform float uUseTexture;
    uniform float uTextureScale;
    
    uniform float uIsWireframe;

    void main() {
        if (uIsWireframe > 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
        
        vec3 N = normalize(vNormal);
        if (!gl_FrontFacing) N = -N;
        vec3 L = normalize(uLightDirection);
        
        vec4 surfaceColor = vec4(uBaseColor, 1.0) * vColor;
        if (uUseTexture > 0.5) {
            vec4 texColor = texture2D(uAlbedoMap, vWorldPos.xz * uTextureScale);
            surfaceColor *= texColor;
        }

        float diff = max(dot(N, L), 0.0);
        vec3 diffuse = diff * uDirectionalLightColor * surfaceColor.rgb;
        vec3 ambient = uAmbientLightColor * surfaceColor.rgb;
        
        gl_FragColor = vec4(ambient + diffuse, surfaceColor.a);
    }
`;
