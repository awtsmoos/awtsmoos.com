
// B"H
/**
 * @file fluidMaterial.js
 * @brief A shader that renders a collection of points as a unified fluid surface (Metaballs).
 */

export const VS_SOURCE_FLUID = `
    // B"H - This simple Vertex Shader creates a full-screen triangle/quad.
    // The real magic happens in the Fragment Shader.
    attribute vec2 aVertexPosition;
    varying vec2 vUv;
    void main() {
        vUv = aVertexPosition * 0.5 + 0.5;
        // Output a clip-space vertex position for the full-screen quad.
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
`;

export const FS_SOURCE_FLUID = `
    precision highp float;
    varying vec2 vUv;

    uniform mat4 uInvViewProjMatrix;
    uniform vec3 uCameraPos;
    uniform vec2 uResolution;

    #define MAX_PARTICLES 60
    uniform vec3 uParticlePositions[MAX_PARTICLES];
    uniform int uParticleCount;
    uniform float uParticleRadius;

    uniform highp vec3 uLightDirection; // B"H - Ensuring consistent precision
    uniform highp vec3 uAmbientLightColor; // B"H - Ensuring consistent precision
    uniform highp vec3 uDirectionalLightColor; // B"H - Ensuring consistent precision

    // Defines the energy field of all particles at a given point
    float getFieldStrength(vec3 p) {
        float totalStrength = 0.0;
        float r2 = uParticleRadius * uParticleRadius;
        for (int i = 0; i < MAX_PARTICLES; i++) {
            if (i >= uParticleCount) break;
            float distSq = dot(p - uParticlePositions[i], p - uParticlePositions[i]);
            // Polynomial falloff: (1 - (d/r)^2)^2 gives a smooth curve
            float falloff = 1.0 - distSq / r2;
            totalStrength += max(0.0, falloff * falloff);
        }
        return totalStrength;
    }

    // Calculates the normal of the implicit surface by checking the gradient of the field
    vec3 getNormal(vec3 p) {
        vec2 e = vec2(0.01, 0.0);
        // Sample the field at slightly offset points to find the direction of greatest change
        return normalize(vec3(
            getFieldStrength(p + e.xyy) - getFieldStrength(p - e.xyy),
            getFieldStrength(p + e.yxy) - getFieldStrength(p - e.yxy),
            getFieldStrength(p + e.yyx) - getFieldStrength(p - e.yyx)
        ));
    }

    void main() {
        // 1. Set up the camera ray for this pixel
        vec2 screenPos = vUv * 2.0 - 1.0;
        vec4 far = uInvViewProjMatrix * vec4(screenPos, 1.0, 1.0);
        vec3 rayDir = normalize(far.xyz / far.w - uCameraPos);
        vec3 rayOrigin = uCameraPos;

        // 2. Raymarch through the scene to find the surface
        float t = 0.0;
        vec3 hitPos = vec3(0.0);
        bool hit = false;
        
        // B"H - The iso-surface threshold. Higher value = "skinnier" fluid that reveals more of the balls.
        const float ISO_LEVEL = 0.8;

        for (int i = 0; i < 150; i++) { 
            vec3 p = rayOrigin + rayDir * t;
            float field = getFieldStrength(p);
            
            if (field > ISO_LEVEL) { 
                hit = true;
                hitPos = p;
                break;
            }
            
            // Adaptive step size - step faster when far from surface
            t += max(0.1, (ISO_LEVEL - field) * 1.0); 
            if (t > 100.0) break;
        }

        if (!hit) {
            discard; // This pixel does not hit the fluid, so render nothing.
        }

        // 3. Lighting calculation at the hit position
        vec3 normal = getNormal(hitPos);
        vec3 lightDir = normalize(uLightDirection);

        // Simple diffuse lighting
        float diff = max(dot(normal, lightDir), 0.0);
        
        vec3 fluidColor = vec3(0.1, 0.5, 0.9); // The solid blue color
        vec3 lighting = uAmbientLightColor + uDirectionalLightColor * diff;
        vec3 finalColor = fluidColor * lighting;

        gl_FragColor = vec4(finalColor, 1.0); // Fully opaque
    }
`;

export class FluidMaterial {
    program = null; gl = null;
    constructor(gl) { this.gl = gl; }
    setProgram(program) { this.program = program; }

    bind(invViewProj, cameraPos, resolution, lightVars, particlePositions, particleRadius) {
        const gl = this.gl;
        gl.useProgram(this.program);
        
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uInvViewProjMatrix'), false, invViewProj);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uCameraPos'), cameraPos);
        gl.uniform2fv(gl.getUniformLocation(this.program, 'uResolution'), resolution);

        gl.uniform3fv(gl.getUniformLocation(this.program, 'uLightDirection'), lightVars.uLightDirection);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uAmbientLightColor'), lightVars.uAmbientLightColor);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uDirectionalLightColor'), lightVars.uDirectionalLightColor);

        const count = Math.min(particlePositions.length, 60);
        gl.uniform1i(gl.getUniformLocation(this.program, 'uParticleCount'), count);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uParticlePositions'), new Float32Array(particlePositions.flat()));
        gl.uniform1f(gl.getUniformLocation(this.program, 'uParticleRadius'), particleRadius);
    }
}