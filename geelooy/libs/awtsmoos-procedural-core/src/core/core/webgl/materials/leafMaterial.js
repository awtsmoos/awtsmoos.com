
// B"H
/**
 * @file leafMaterial.js
 * @brief Shader for realistic foliage with subsurface translucency and waxy specular.
 */

export const VS_SOURCE_LEAF = `
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec4 aVertexColor; // UVs packed in RG, or Tint in RGB

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uModelMatrix; 
    uniform mat4 uNormalMatrix;
    
    uniform highp float uTime;
    uniform highp vec3 uWindVector;
    uniform float uWindEnabled;

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;
    varying vec4 vColor;

    // Pseudo-random for flutter
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

    void main(void) {
        vec3 pos = aVertexPosition;
        vec4 worldPos = uModelMatrix * vec4(pos, 1.0);
        
        // --- Wind Logic ---
        if (uWindEnabled > 0.5) {
            // Global sway based on height
            float sway = max(0.0, worldPos.y * 0.1); 
            float t = uTime * 1.5;
            
            // Large movement
            float wx = sin(t + worldPos.x * 0.3 + worldPos.z * 0.3) * uWindVector.x;
            float wz = cos(t * 0.7 + worldPos.x * 0.2) * uWindVector.z;
            
            worldPos.x += wx * sway * 0.15;
            worldPos.z += wz * sway * 0.15;
            
            // High frequency flutter (Leaf tip vibration)
            // Assuming texture UVs are in aVertexColor.rg (standard for this engine)
            // Or if generated geometry, leaf tips might be identifiable.
            // Let's use local position noise.
            float flutter = sin(t * 8.0 + worldPos.x * 2.0 + worldPos.y * 3.0 + worldPos.z * 2.0) * 0.05;
            
            // Apply more flutter at higher Y (tops of trees)
            worldPos.xyz += flutter * min(1.0, worldPos.y * 0.05) * uWindVector * 0.2;
        }

        vWorldPos = worldPos.xyz;
        vNormal = normalize(mat3(uNormalMatrix) * aVertexNormal);
        
        // Unpack UVs from Color (TreeGenerator specific packing)
        vUv = aVertexColor.rg; 
        
        // Tint is white by default, can be passed if modified
        vColor = vec4(1.0); 

        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
        
        // Re-apply world position wind to clip space for consistency? 
        // No, standard pipeline uses local 'pos' for matrix calc usually. 
        // But since we modified worldPos, we need to output that.
        // We lack a separate ViewProjection matrix uniform in standard set usually.
        // We will reconstruct View * World.
        // Actually, uModelViewMatrix * pos gives ViewPos. 
        // To support wind correctly we need to decompose or modify 'pos' before mult.
        // Hack: Apply similar offset to local pos.
        
        if (uWindEnabled > 0.5) {
             float sway = max(0.0, pos.y * 0.1); 
             float t = uTime * 1.5;
             float wx = sin(t + pos.x * 0.3 + pos.z * 0.3) * uWindVector.x;
             float wz = cos(t * 0.7 + pos.x * 0.2) * uWindVector.z;
             pos.x += wx * sway * 0.15;
             pos.z += wz * sway * 0.15;
             // Recalculate GL Position
             gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
        }
    }
`;

export const FS_SOURCE_LEAF = `
    precision mediump float;

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;
    varying vec4 vColor;

    uniform sampler2D uAlbedoMap;
    uniform float uAlphaTest;
    
    uniform vec3 uViewPos;
    uniform highp vec3 uLightDirection;
    uniform highp vec3 uDirectionalLightColor;
    uniform highp vec3 uAmbientLightColor;

    void main(void) {
        vec4 texColor = texture2D(uAlbedoMap, vUv);
        
        // Alpha Cutoff
        if (texColor.a < uAlphaTest) discard;

        // Normal preparation (Double sided lighting)
        vec3 N = normalize(vNormal);
        if (!gl_FrontFacing) N = -N;

        vec3 L = normalize(uLightDirection);
        vec3 V = normalize(uViewPos - vWorldPos);
        vec3 H = normalize(L + V);

        // 1. Diffuse (Wrap Lighting)
        // Standard NdotL is too harsh for foliage. Wrap lets light bleed around curvature.
        float wrap = 0.5;
        float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
        vec3 diffuse = NdotL * uDirectionalLightColor * texColor.rgb;

        // 2. Translucency (Backlighting)
        // Light passing through the leaf when sun is behind it.
        // We use -L dot V.
        float backLight = max(0.0, dot(V, -L));
        // Power controls focus of the "sun spot" on the leaf
        float translucency = pow(backLight, 4.0) * 0.8; 
        // Add tint (sunlight color + leaf color)
        vec3 transColor = translucency * uDirectionalLightColor * texColor.rgb * 1.2;

        // 3. Specular (Waxy Cuticle)
        float NdotH = max(0.0, dot(N, H));
        float spec = pow(NdotH, 16.0); // Broad, waxy highlight
        vec3 specular = uDirectionalLightColor * spec * 0.15; // Low intensity

        // 4. Ambient
        vec3 ambient = uAmbientLightColor * texColor.rgb;

        vec3 finalColor = ambient + diffuse + transColor + specular;

        // Tone Mapping / Contrast Fix
        // Leaves often look washed out. Bump contrast.
        finalColor = pow(finalColor, vec3(1.1)); // Slight contrast boost

        gl_FragColor = vec4(finalColor, texColor.a);
    }
`;

export class LeafMaterial {
    program = null; gl = null;
    constructor(gl) { this.gl = gl; }
    setProgram(program) { this.program = program; }

    bind(matrices, cameraPos, lightVars, shaderVars, texture) {
        const gl = this.gl;
        gl.useProgram(this.program);
        
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uProjectionMatrix'), false, matrices.projection);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelViewMatrix'), false, matrices.modelView);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelMatrix'), false, matrices.worldModel);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uNormalMatrix'), false, matrices.normal);

        gl.uniform3fv(gl.getUniformLocation(this.program, 'uViewPos'), cameraPos);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uTime'), performance.now() / 1000);
        
        // Light
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uLightDirection'), lightVars.uLightDirection || [0,1,0]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uDirectionalLightColor'), lightVars.uDirectionalLightColor || [1,1,1]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uAmbientLightColor'), lightVars.uAmbientLightColor || [0.2,0.2,0.2]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uWindVector'), lightVars.uWindVector || [0,0,0]);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uWindEnabled'), shaderVars.uWindEnabled || 0.0);

        // Texture
        gl.uniform1f(gl.getUniformLocation(this.program, 'uAlphaTest'), shaderVars.uAlphaTest || 0.5);
        
        if (texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(gl.getUniformLocation(this.program, 'uAlbedoMap'), 0);
        }
    }
}
