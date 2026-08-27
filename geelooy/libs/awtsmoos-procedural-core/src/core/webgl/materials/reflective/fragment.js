
// B"H
/**
 * @file fragment.js
 * @brief High-fidelity Reflective PBR-Lite shader with Procedural Checkered Metal Grid.
 * 
 * THE PSALM OF THE POLISHED GROUND:
 * The earth was once void and without form or light,
 * But now it gleams silver in the observer's sight!
 * We weave the Grid of Judgment, the lines of the law,
 * Creating a surface without blemish or flaw.
 * The shadows of creation fall soft on the tile,
 * Reflecting the Sun with a metallic smile!
 */
export const FS_SOURCE_REFLECTIVE = `
    #extension GL_OES_standard_derivatives : enable
    precision highp float;
    
    #include <toneMapping>
    #include <noise>

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec4 vColor;
    varying highp vec4 vShadowCoord;

    uniform vec3 uViewPos; 
    uniform vec3 uBaseColor;
    uniform float uMetallic;
    uniform float uRoughness;
    
    uniform highp vec3 uLightDirection;
    uniform highp vec3 uDirectionalLightColor;
    uniform highp vec3 uAmbientLightColor;

    // B"H - THE RESTORED SHADOW UNIFORMS
    uniform sampler2D uShadowMap;
    uniform vec2 uShadowMapSize;
    uniform float uShadowsEnabled;

    // B"H - Procedural Floor Settings
    uniform float uUseChecker; 
    uniform float uUseGrid;
    uniform float uTextureScale;

    /**
     * B"H - Calculates the Tzimtzum (Concealment) of light.
     */
    float calculateShadow(vec4 sc, vec3 n, vec3 l) {
        vec3 p = sc.xyz / sc.w;
        if(p.z > 1.0 || p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return 0.0;
        
        float bias = max(0.005 * (1.0 - dot(n, l)), 0.0008);
        float shad = 0.0;
        vec2 ts = 1.0 / uShadowMapSize;
        
        // Soft PCF Shadow filtering
        for(int x = -1; x <= 1; ++x) {
            for(int y = -1; y <= 1; ++y) {
                float pcf = texture2D(uShadowMap, p.xy + vec2(x, y) * ts).r;
                if (p.z - bias > pcf) shad += 1.0;
            }
        }
        return shad / 9.0;
    }

    void main(void) {
        vec3 N = normalize(vNormal);
        if (!gl_FrontFacing) N = -N;
        vec3 V = normalize(uViewPos - vWorldPos);
        vec3 L = normalize(uLightDirection);
        vec3 H = normalize(L + V);

        // B"H - Start with the base metallic essence
        vec3 alb = uBaseColor;
        float roughness = uRoughness;

        // B"H - PROCEDURAL CHECKERED METAL GRID
        if (uUseGrid > 0.5 || uUseChecker > 0.5) {
            vec2 st = vWorldPos.xz * uTextureScale;
            
            // Checkered Panel Logic
            if (uUseChecker > 0.5) {
                float check = mod(floor(st.x) + floor(st.y), 2.0);
                // Varying metal shades for the checkerboard
                alb = mix(alb * 0.85, alb * 1.15, check);
                // Alternate roughness for a richer look
                roughness = mix(roughness * 1.5, roughness, check);
            }
            
            // Recessed Grid Line Logic
            if (uUseGrid > 0.5) {
                vec2 grid = abs(fract(st - 0.5) - 0.5) / fwidth(st);
                float line = min(grid.x, grid.y);
                float gridLine = 1.0 - min(line, 1.0);
                
                // Darken and dull the grid lines (the grout)
                alb = mix(alb, vec3(0.05, 0.05, 0.06), gridLine * 0.8);
                roughness = mix(roughness, 1.0, gridLine);
            }
        }

        // PBR Lighting components
        float diff = max(dot(N, L), 0.0);
        float spec = pow(max(dot(N, H), 0.0), mix(32.0, 2048.0, uMetallic * (1.0 - roughness))) * uMetallic;
        
        // Shadow calculation
        float shadow = (uShadowsEnabled > 0.5) ? calculateShadow(vShadowCoord, N, L) : 0.0;
        float shadFact = mix(1.0, 0.2, shadow);

        vec3 amb = uAmbientLightColor * alb;
        vec3 dCol = uDirectionalLightColor * alb * diff;
        vec3 sCol = uDirectionalLightColor * spec;

        // Final Radiance composite
        vec3 final = amb + (dCol + sCol) * shadFact;
        
        gl_FragColor = vec4(pow(aces(final * 0.9), vec3(0.4545)), 1.0);
    }
`;
