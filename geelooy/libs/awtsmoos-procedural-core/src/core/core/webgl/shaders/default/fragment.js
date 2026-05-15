
// B"H

/**
 * @file fragment.js
 * @brief The divine logic for light and shadow, revealing the appearance of existence.
 */

export const FS_SOURCE_DEFAULT = `
    #extension GL_OES_standard_derivatives : enable
    precision mediump float;
    
    #include <toneMapping>

    varying lowp vec4 vColor;
    varying highp vec3 vNormal;
    varying highp vec3 vWorldNormal; 
    varying highp vec3 vFragPos;
    varying highp vec4 vShadowCoord;
    varying highp vec3 vWorldPos;
    varying highp vec2 vTextureCoord; 
    
    uniform highp vec3 uAmbientLightColor;
    uniform highp vec3 uDirectionalLightColor;
    uniform highp vec3 uLightDirection; 
    uniform sampler2D uShadowMap;
    uniform vec2 uShadowMapSize; 
    uniform sampler2D uAlbedoMap;
    uniform float uUseTexture;    
    uniform highp float uUseTriplanar; 
    uniform float uTextureScale;  
    uniform float uAlphaTest;
    uniform int uPatternType; 
    uniform float uShadowsEnabled; 
    uniform float uUseSolidColor; 
    uniform vec4 uSolidColor;

    float calculateShadow(vec4 shadowCoord, vec3 normal, vec3 lightDir) {
        vec3 projCoords = shadowCoord.xyz / shadowCoord.w;
        if(projCoords.z > 1.0 || projCoords.x < 0.0 || projCoords.x > 1.0 || projCoords.y < 0.0 || projCoords.y > 1.0) return 0.0;
        float currentDepth = projCoords.z;
        float cosTheta = clamp(dot(normal, lightDir), 0.0, 1.0);
        float bias = max(0.005 * (1.0 - cosTheta), 0.0005);
        float shadow = 0.0;
        vec2 texelSize = 1.0 / uShadowMapSize;
        for(int x = -1; x <= 1; ++x) {
            for(int y = -1; y <= 1; ++y) {
                vec2 offset = vec2(float(x), float(y)) * texelSize;
                float pcfDepth = texture2D(uShadowMap, projCoords.xy + offset).r; 
                shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;        
            }    
        }
        return shadow / 9.0;
    }

    vec4 applyTriplanar(vec3 normal, vec3 pos, float scale) {
        vec3 blend = abs(normal);
        float sum = blend.x + blend.y + blend.z;
        blend /= max(sum, 0.001);
        vec4 colX = texture2D(uAlbedoMap, pos.zy * scale);
        vec4 colY = texture2D(uAlbedoMap, pos.xz * scale);
        vec4 colZ = texture2D(uAlbedoMap, pos.xy * scale);
        return colX * blend.x + colY * blend.y + colZ * blend.z;
    }

    void main(void) {
        if (uUseSolidColor > 0.5) { gl_FragColor = uSolidColor; return; }
        vec3 normal = normalize(vNormal);
        if (!gl_FrontFacing) normal = -normal;
        vec3 lightDir = normalize(uLightDirection);
        
        vec4 surfaceColor;
        if (uUseTexture > 0.5) {
            if (uUseTriplanar > 0.5) surfaceColor = applyTriplanar(normalize(vWorldNormal), vWorldPos, uTextureScale);
            else surfaceColor = texture2D(uAlbedoMap, vTextureCoord * uTextureScale);
        } else {
            surfaceColor = vColor;
        }

        if (uPatternType == 1) { 
            vec2 st = vWorldPos.xz * 0.2;
            float check = mod(floor(st.x) + floor(st.y), 2.0);
            surfaceColor.rgb *= mix(0.15, 1.0, check);
        } else if (uPatternType == 2) { 
            float stripe = mod(vWorldPos.x * 2.0, 2.0);
            surfaceColor.rgb *= mix(0.5, 1.0, step(1.0, stripe));
        }
        
        if (uAlphaTest > 0.0 && surfaceColor.a < uAlphaTest) discard;

        vec3 skyAmb = uAmbientLightColor * 0.7; 
        vec3 groundAmb = uAmbientLightColor * 0.3; 
        float hemi = normal.y * 0.5 + 0.5;
        vec3 ambient = mix(groundAmb, skyAmb, hemi) * surfaceColor.rgb;

        float diff = max(dot(normal, lightDir), 0.0);
        float shadow = (uShadowsEnabled > 0.5) ? calculateShadow(vShadowCoord, normal, lightDir) : 0.0;
        float shadowFactor = mix(1.0 - shadow, 0.15, shadow * (1.0 - diff));
        
        vec3 rawLighting = ambient + shadowFactor * diff * uDirectionalLightColor * surfaceColor.rgb;
        
        // B"H - Perfect 8-bit safety via internal ACES and Gamma
        float exposure = 0.9;
        vec3 tm = aces(rawLighting * exposure);
        gl_FragColor = vec4(pow(tm, vec3(0.4545)), surfaceColor.a); 
    }
`;
