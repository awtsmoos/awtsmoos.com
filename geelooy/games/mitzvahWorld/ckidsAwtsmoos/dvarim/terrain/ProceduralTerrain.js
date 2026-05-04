
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

        // B"H: Grass green Lambert with height-based color snippet
        const GRASS_TERRAIN_SNIPPETS = {
            uniforms: {
                uGrassLight: { value: { r: 0x4d/255, g: 0x8b/255, b: 0x31/255 } }, // More vibrant light green
                uGrassDark:  { value: { r: 0x1a/255, g: 0x3d/255, b: 0x14/255 } }, // Deep forest dark green
            },
            fragment: {
                head: `varying vec3 vPosition; uniform vec3 uGrassLight; uniform vec3 uGrassDark;`,
                color: `
                    // B"H: Smooth height-based transition for hills and valleys
                    float h = vPosition.y;
                    float hillFactor = smoothstep(-5.0, 40.0, h);
                    vec3 grassColor = mix(uGrassDark, uGrassLight, hillFactor);
                    
                    // B"H: Subtle noise-like variation based on XZ position
                    float noise = fract(sin(dot(vPosition.xz, vec2(12.9898, 78.233))) * 43758.5453);
                    grassColor = mix(grassColor, grassColor * 1.1, noise * 0.2);

                    diffuseColor.rgb = grassColor;
                `
            },
            vertex: {
                head: `varying vec3 vPosition;`,
                main: `vPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
            }
        };
        const mat = this.createMaterial('Lambert', { color: 0x4a7c59, side: 2 }, GRASS_TERRAIN_SNIPPETS);

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
}
