
// B"H
/**
 * @file vertex.js
 * @brief The divine blueprint for vertex transformation, manifesting form from position.
 *        Enhanced with wind simulation for vibrant life.
 */
export const VS_SOURCE_DEFAULT = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aVertexNormal;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uModelMatrix; 
    uniform mat4 uNormalMatrix;
    uniform mat4 uLightSpaceMatrix;

    uniform float uBendAmountX;
    uniform float uBendAmountZ;
    uniform float uBendHeightOffset;
    
    // B"H - Wind Uniforms
    uniform highp float uTime; 
    uniform highp vec3 uWindVector; 
    uniform float uWindEnabled;

    varying lowp vec4 vColor;
    varying highp vec3 vNormal; 
    varying highp vec3 vWorldNormal; 
    varying highp vec3 vFragPos;
    varying highp vec4 vShadowCoord;
    varying highp vec3 vWorldPos;
    varying highp vec2 vTextureCoord; 
    uniform highp float uUseTriplanar; 

    const mat4 biasMat = mat4(
        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 0.5, 0.0,
        0.5, 0.5, 0.5, 1.0
    );

    void main(void) {
        vec3 pos = aVertexPosition.xyz;
        
        // --- Static Bend (Global Deformation) ---
        float bendFactor = max(0.0, pos.y - uBendHeightOffset);
        pos.x += uBendAmountX * bendFactor * bendFactor * 0.1;
        pos.z += uBendAmountZ * bendFactor * bendFactor * 0.1;

        vec4 worldPos = uModelMatrix * vec4(pos, 1.0);
        
        // --- Dynamic Wind Simulation ---
        if (uWindEnabled > 0.5) {
            // Sway based on height (roots dont move)
            float swayPower = max(0.0, pos.y * 0.1); 
            float t = uTime * 2.0;
            
            // Simple sinusoidal wind
            float wx = sin(t + worldPos.x * 0.5 + worldPos.z * 0.5) * uWindVector.x;
            float wz = cos(t * 0.8 + worldPos.x * 0.3) * uWindVector.z;
            
            // Apply wind
            worldPos.x += wx * swayPower * 0.2;
            worldPos.z += wz * swayPower * 0.2;
            
            // High frequency flutter for leaves (using world pos noise)
            if (pos.y > 2.0) {
                float flutter = sin(t * 10.0 + worldPos.x * 5.0 + worldPos.y * 5.0) * 0.05;
                worldPos.x += flutter;
                worldPos.y += flutter;
                worldPos.z += flutter;
            }
        }

        vFragPos = worldPos.xyz;
        vWorldPos = worldPos.xyz; 
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
        
        // Apply wind offset to clip position too?
        // Ideally we transform pos, but we applied wind to worldPos.
        // Let's Recalculate view projection from worldPos to ensure consistency
        // Note: uModelViewMatrix includes View * Model. We only have View * Projection separated usually?
        // Here uModelViewMatrix is passed. We need VP * WorldPos.
        // But the shader logic assumes uModelViewMatrix * localPos.
        // If we modify worldPos, we need VP matrix separately.
        // Hack: Just modify local 'pos' before matrix mul if possible?
        // Transforming 'worldPos' implies we need 'uViewProjectionMatrix'.
        // Standard pipeline: gl_Position = Proj * View * World.
        
        // Let's modify local pos instead for simple vertex shader wind
        // Reset worldPos calculation based on modified local pos
        vec3 windPos = pos;
        if (uWindEnabled > 0.5) {
             float swayPower = max(0.0, pos.y * 0.1); 
             float t = uTime * 2.0;
             float wx = sin(t + pos.x * 0.5 + pos.z * 0.5) * uWindVector.x;
             float wz = cos(t * 0.8 + pos.x * 0.3) * uWindVector.z;
             windPos.x += wx * swayPower * 0.2;
             windPos.z += wz * swayPower * 0.2;
        }
        
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(windPos, 1.0);
        
        // Recalculate world pos for lighting/shadows
        worldPos = uModelMatrix * vec4(windPos, 1.0);
        vFragPos = worldPos.xyz;
        vWorldPos = worldPos.xyz;

        vNormal = normalize(mat3(uNormalMatrix) * aVertexNormal);
        vWorldNormal = normalize(mat3(uModelMatrix) * aVertexNormal);
        vColor = aVertexColor;
        
        if (uUseTriplanar < 0.5) {
            vTextureCoord = aVertexColor.rg; 
        } else {
            vTextureCoord = vec2(worldPos.x * 0.05 + 0.5, worldPos.z * 0.05 + 0.5); 
        }

        vec3 worldNormalForShadow = normalize(mat3(uModelMatrix) * aVertexNormal);
        vec4 offsetWorldPos = vec4(worldPos.xyz + worldNormalForShadow * 0.005, 1.0);
        vShadowCoord = biasMat * uLightSpaceMatrix * offsetWorldPos;
    }
`;
