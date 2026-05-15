
// B"H
/**
 * @file skin.js
 * @brief Enhanced organic skin shaders. Now correctly handling 2D noise mapping for 3D surfaces.
 */

export const VS_SOURCE_SKIN = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec4 aVertexColor;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uNormalMatrix;
    uniform mat4 uModelMatrix;

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec4 vColor;

    void main(void) {
        vec4 worldPos = uModelMatrix * aVertexPosition;
        vWorldPos = worldPos.xyz;
        vNormal = normalize(mat3(uNormalMatrix) * aVertexNormal);
        vColor = aVertexColor;
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

export const FS_SOURCE_SKIN = `
    precision highp float;
    
    #include <noise>
    #include <toneMapping>

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec4 vColor;

    uniform vec3 uViewPos;
    uniform vec3 uBaseColor;
    uniform vec3 uLightDirection; 
    uniform vec3 uDirectionalLightColor; 
    uniform vec3 uAmbientLightColor; 

    void main(void) {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(uViewPos - vWorldPos);
        vec3 L = normalize(uLightDirection);

        // B"H - MICRO-STRUCTURE (Pores & Wrinkles)
        // Corrected: cellular noise expects vec2. We use X and Z for horizontal skin mapping.
        float pores = cellular(vWorldPos.xz * 250.0);
        float poreMask = smoothstep(0.1, 0.35, pores);
        
        // Simplex noise (3D) used for general roughness
        float microRoughness = snoise(vWorldPos * 400.0);

        vec3 normalOffset = vec3(
            snoise(vWorldPos * 250.0), 
            snoise(vWorldPos * 250.0 + 10.0), 
            snoise(vWorldPos * 250.0 + 20.0)
        ) * 0.08 * (1.0 - poreMask);
        
        N = normalize(N + normalOffset);

        // B"H - MACRO-STRUCTURE (Subdermal tones)
        // Corrected: snoise takes vec3, so worldPos is valid here.
        float blotch = snoise(vWorldPos * 8.0);
        float fineBlotch = snoise(vWorldPos * 25.0);
        
        vec3 bloodTone = vec3(0.8, 0.25, 0.2); 
        vec3 veinTone = vec3(0.35, 0.45, 0.65); 
        
        vec3 skinTone = mix(uBaseColor, bloodTone, smoothstep(0.2, 0.8, blotch) * 0.12);
        skinTone = mix(skinTone, veinTone, smoothstep(0.3, 0.8, -blotch + fineBlotch * 0.5) * 0.08);

        skinTone *= mix(0.75, 1.0, poreMask);

        float diff = max(dot(N, L), 0.0);
        float wrap = 0.35;
        float sss = max(0.0, (dot(N, L) + wrap) * (1.0 / (1.0 + wrap)));
        vec3 sssColor = vec3(0.85, 0.15, 0.05) * pow(sss, 2.5) * 0.3;

        float hemi = N.y * 0.5 + 0.5;
        vec3 skyAmb = uAmbientLightColor * 1.5;
        vec3 groundAmb = uAmbientLightColor * 0.8;
        vec3 ambient = mix(groundAmb, skyAmb, hemi) * skinTone;

        vec3 diffuse = diff * uDirectionalLightColor * skinTone;

        vec3 H = normalize(L + V);
        float specPower = mix(16.0, 48.0, poreMask); 
        float spec = pow(max(dot(N, H), 0.0), specPower);
        vec3 specular = vec3(1.0, 0.95, 0.9) * spec * 0.2 * (0.8 + 0.2 * microRoughness) * poreMask;

        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 4.0);
        vec3 rim = vec3(1.0, 0.9, 0.8) * fresnel * 0.25; 

        vec3 finalColor = ambient + diffuse + sssColor + rim + specular;
        
        float exposure = 0.9;
        vec3 tm = aces(finalColor * exposure);
        gl_FragColor = vec4(pow(tm, vec3(0.4545)), 1.0);
    }
`;
