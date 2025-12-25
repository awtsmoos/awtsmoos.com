
/**
 * B"H
 * @file materialGenerator.js
 * Generates materials for nature items, including wind shaders and procedural textures.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    get(type) {
        let mat;
        
        if (type.includes('grass')) {
            mat = new THREE.MeshLambertMaterial({ 
                color: 0xffffff, // White so we can tint it per instance
                side: THREE.DoubleSide,
                wireframe: false
            });
            this.injectWind(mat);
        } else if (type.includes('rock')) {
            // B"H: Smooth Shaded Rock with Procedural Texture
            const rockTexture = this.generateRockTexture();
            
            mat = new THREE.MeshStandardMaterial({ 
                map: rockTexture,
                color: 0xffffff, // White base to allow tinting
                roughness: 0.9,
                metalness: 0.1,
                flatShading: false, // B"H: Smooth shading
                side: THREE.FrontSide // Optimization: Solid objects don't need double side usually
            });
        } else {
            mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        }
        
        return mat;
    },
    
    generateRockTexture() {
        if (this._rockTexCache) return this._rockTexCache;

        const size = 256;
        let canvas;

        // B"H: Handle Worker Environment (No DOM)
        if (typeof OffscreenCanvas !== 'undefined') {
            canvas = new OffscreenCanvas(size, size);
        } else if (typeof document !== 'undefined') {
            canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
        } else {
            // Fallback if neither is available (unlikely)
            console.warn("B\"H: No canvas support for rock texture generation.");
            return new THREE.Texture();
        }

        const ctx = canvas.getContext('2d');
        
        // 1. Base Grey
        ctx.fillStyle = "#888888";
        ctx.fillRect(0,0,size,size);
        
        // 2. Noise Generation
        const idata = ctx.getImageData(0,0,size,size);
        const buffer = idata.data;
        
        for(let i=0; i<buffer.length; i+=4) {
            // Random noise -50 to +50
            const noise = (Math.random() - 0.5) * 60; 
            
            // Add noise to base grey (approx 136)
            const val = 136 + noise;
            
            buffer[i] = val;   // R
            buffer[i+1] = val; // G
            buffer[i+2] = val; // B
            // Alpha stays 255
        }
        
        ctx.putImageData(idata, 0, 0);
        
        // 3. Add some "cracks" or veins
        ctx.strokeStyle = "rgba(40, 40, 40, 0.1)";
        ctx.lineWidth = 2;
        for(let k=0; k<5; k++) {
            ctx.beginPath();
            ctx.moveTo(Math.random()*size, Math.random()*size);
            ctx.bezierCurveTo(
                Math.random()*size, Math.random()*size,
                Math.random()*size, Math.random()*size,
                Math.random()*size, Math.random()*size
            );
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        this._rockTexCache = texture;
        return texture;
    },

    injectWind(material) {
        // Only enable alphaTest if a map is present later
        if(material.map) material.alphaTest = 0.5;
        
        material.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = { value: 0 };
            shader.uniforms.uPlayerPosition = { value: new THREE.Vector3(0, -1000, 0) }; // Default far away
            
            // B"H: Simplex Noise GLSL
            const noiseGLSL = `
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

                float snoise(vec2 v) {
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                    vec2 i  = floor(v + dot(v, C.yy) );
                    vec2 x0 = v - i + dot(i, C.xx);
                    vec2 i1;
                    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz;
                    x12.xy -= i1;
                    i = mod289(i);
                    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                    m = m*m ;
                    m = m*m ;
                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5;
                    vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox;
                    m *= 1.79284291400159 - 0.85373472095314 * ( a0.x * a0.x + h.x * h.x + h.y * h.y + h.z * h.z ); // Normalise gradients
                    vec3 g;
                    g.x  = a0.x  * x0.x  + h.x  * x0.y;
                    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }
            `;

            shader.vertexShader = `
                uniform float uTime;
                uniform vec3 uPlayerPosition;
                ${noiseGLSL}
            ` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <project_vertex>', 
                `
                // 1. Get World Position of Instance
                vec4 worldInstancePos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
                vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
                
                // 2. Geometry Factors
                float h = position.y; // Normalized height (0 to 1 approx)
                if (h < 0.1) h = 0.0; // Anchor bottom vertices completely

                // 3. Wind Sway
                // Use World X/Z for noise coordinate to make wind consistent across field
                float noiseVal = snoise(vec2(worldInstancePos.x * 0.05 + uTime * 0.2, worldInstancePos.z * 0.05 + uTime * 0.2));
                // Add higher frequency jitter
                float jitter = snoise(vec2(worldInstancePos.x * 0.5 + uTime, worldInstancePos.z * 0.5));
                
                float leanStrength = 0.2 + (noiseVal * 0.1); 
                float bendX = (noiseVal + jitter * 0.2) * leanStrength * h;
                float bendZ = (cos(uTime * 0.5 + worldInstancePos.x) * 0.1) * h;

                mvPosition.x += bendX;
                mvPosition.z += bendZ;

                // 4. Player Interaction (Bending)
                float dist = distance(uPlayerPosition, worldInstancePos.xyz);
                float radius = 1.5;
                if (dist < radius) {
                    float power = 1.0 - (dist / radius);
                    power = pow(power, 2.0); // Curve the falloff
                    
                    vec3 pushDir = normalize(worldInstancePos.xyz - uPlayerPosition);
                    pushDir.y = 0.0; // Keep push horizontal
                    
                    // Bend away from player
                    mvPosition.x += pushDir.x * power * 1.0 * h;
                    mvPosition.z += pushDir.z * power * 1.0 * h;
                    // Squish down slightly when stepped on
                    mvPosition.y -= power * 0.3 * h; 
                }

                // 5. LOD (Distance Scaling)
                // Calculate distance from camera to the instance (not the vertex)
                // We use 'modelViewMatrix' to get camera relative position of the instance center
                // Actually 'worldInstancePos' is world space. We need camera world pos.
                // In Three.js, cameraPosition is available in vertex shader.
                
                float camDist = distance(cameraPosition, worldInstancePos.xyz);
                float lodStart = 60.0;
                float lodEnd = 80.0;
                float lodScale = 1.0 - smoothstep(lodStart, lodEnd, camDist);
                
                // Collapse to zero if too far
                if(lodScale < 0.01) lodScale = 0.0;
                
                // Apply scaling relative to instance center
                // Since mvPosition is already transformed, we need to scale relative to the instance origin
                vec3 instanceCenter = worldInstancePos.xyz;
                vec3 offset = mvPosition.xyz - instanceCenter;
                mvPosition.xyz = instanceCenter + offset * lodScale;

                mvPosition = modelViewMatrix * vec4(mvPosition.xyz, 1.0); // Convert back to view space for projection
                
                // Standard Projection
                gl_Position = projectionMatrix * mvPosition;
                `
            );
            
            // Bypass standard modelView transform since we did it manually
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '');
            
            material.userData.shader = shader;
        };
    }
};
