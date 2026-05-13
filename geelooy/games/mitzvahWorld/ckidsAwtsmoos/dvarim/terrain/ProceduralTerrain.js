
/**
 * B"H
 * @module ProceduralTerrain
 * @description
 * 🌿 THE GROUND OF REVELATION 🌿
 */
import Domem from "../../chayim/domem/index.js";

export default class ProceduralTerrain extends Domem {
    type = "proceduralTerrain";

    constructor(op, olam) {
        super(op, olam);
        this.width = op.width || 1500;
        this.depth = op.depth || 1500;
        this.thickness = op.thickness || 4.0;
        this.segments = op.segments || 32;
        this.hills = op.hills || [];
        this.textureType = op.textureType || "safegrass";
    }

    async heescheel(olam) {
        this.olam = olam;
        const label = `[Terrain: ${this.name}]`;

        const segments = this.segments || 64;
        const geometry = this.createPlaneGeometry(this.width, this.depth, segments, segments);
        if (geometry.rotateX) geometry.rotateX(-Math.PI / 2); 

        if (this.hills && this.hills.length > 0) {
            const pos = geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const z = pos.getZ(i);
                let h = 0;
                for (const hill of this.hills) {
                    const dx = x - (hill.x || 0);
                    const dz = z - (hill.z || 0);
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < (hill.radius || 50)) {
                        const influence = (1 + Math.cos((Math.PI * dist) / hill.radius)) / 2;
                        h += influence * (hill.height || 10);
                    }
                }
                pos.setY(i, h);
            }
            if (geometry.computeVertexNormals) geometry.computeVertexNormals();
        }

        let grassTex = null;
        if (olam && typeof olam.loadTexture === 'function') {
            try {
                // B"H: Drawing down the holy texture of the earth
                grassTex = await olam.loadTexture({ 
                    url: 'awtsmoostex://' + (this.textureType || 'safegrass'), 
                    shouldRepeat: true, 
                    repeatX: this.width / 20, 
                    repeatY: this.depth / 20 
                });
            } catch (e) {
                console.warn("B\"H - ⚠️ [ProceduralTerrain] Texture loading failed:", e);
            }
        }

        // B"H: Grass green Lambert with high-quality micro-noise and shimmer
        const GRASS_TERRAIN_SNIPPETS = {
            uniforms: {
                uTime:       { value: 0 },
                uGrassLight: { value: { r: 0x4d/255, g: 0x8b/255, b: 0x31/255 } }, 
                uGrassDark:  { value: { r: 0x1a/255, g: 0x3d/255, b: 0x14/255 } }, 
            },
            fragment: {
                head: `
                    varying vec3 vPosition; 
                    uniform float uTime;
                    uniform vec3 uGrassLight; 
                    uniform vec3 uGrassDark;

                    // B"H: High-frequency noise for micro-detail
                    float hash(vec2 p) {
                        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                    }
                `,
                color: `
                    // B"H: Smooth height-based transition
                    float h = vPosition.y;
                    float hillFactor = smoothstep(-5.0, 40.0, h);
                    vec3 gradientColor = mix(uGrassDark, uGrassLight, hillFactor);
                    
                    // B"H: Micro-noise for texture depth
                    float micro = hash(vPosition.xz * 25.0);
                    gradientColor = mix(gradientColor, gradientColor * 1.2, micro * 0.15);

                    // B"H: The Shimmer of Divine Sparks
                    float shimmer = pow(hash(vPosition.xz * 0.5 + floor(uTime * 1.5)), 20.0);
                    gradientColor += vec3(0.1, 0.2, 0.1) * shimmer;

                    // B"H: Blend with the texture and boost
                    diffuseColor.rgb *= gradientColor * 2.0;
                `
            },
            vertex: {
                head: `varying vec3 vPosition;`,
                main: `vPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
            }
        };
        const mat = this.createMaterial('Lambert', { 
            color: 0xffffff, 
            map: grassTex,
            side: 2 
        }, GRASS_TERRAIN_SNIPPETS);



        this.mesh = this.createMesh(geometry, mat);
        this.mesh.name = this.name;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.visible = true;
        this.mesh.frustumCulled = false; 

        if (this.position) {
            this.mesh.position.set(
                (this.position.x || 0),
                (this.position.y || 0),
                (this.position.z || 0)
            );
        }

        this.mesh.updateMatrix();
        this.mesh.updateMatrixWorld();
        this.mesh.userData.isSolid = true;
        this.mesh.userData.isTerrain = true;

        await olam.hoyseef(this);
        
        if(this.olam.worldOctree) {
            this.olam.worldOctree.addObject(this.mesh);
        }

        this.isReady = true;
    }

    /**
     * @method heesHawvoos
     * @description B"H — Animates the grass shimmer each frame, ticking uTime forward.
     */
    heesHawvoos(dt) {
        if (!this.isReady || !this.mesh?.material?.userData?.shader) return;
        const su = this.mesh.material.userData.shader.uniforms;
        if (su?.uTime) su.uTime.value += dt;
    }
}

