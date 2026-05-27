
/**
 * B"H
 * @file proceduralTree.js
 * Generates dynamic trees based on genetic parameters.
 */
import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';
import TreeGenerator from "./trees/treeGenerator.js";
import TreePresets from "./trees/treePresets.js";

export default class ProceduralTree extends Tzomayach {
    type = "proceduralTree";
    static itemName = "Tree Seed";
    static description = "Plants a procedural tree.";
    static isBuildable = true; 
    
    constructor(op, olam) {
        // Ensure update loop runs for wind animation
        op.heesHawveh = true; 
        super(op, olam); 
        
        // B"H: Load Preset
        const presetName = op.itemData?.preset || op.preset || 'Oak Medium';
        this.options = JSON.parse(JSON.stringify(TreePresets[presetName] || TreePresets['Oak Medium']));
        
        if(op.seed) this.options.seed = op.seed;
        else this.options.seed = Math.random() * 65536;
        
        this.on("heesHawvoos", (dt) => {
            if(this.leavesMaterial && this.leavesMaterial.userData.shader) {
                 this.leavesMaterial.userData.shader.uniforms.uTime.value += dt;
            }
        });
    }

    /**
     * B"H
     * Generates the tree data structures.
     */
    generateGeometry() {
        // console.log("B\"H: Generating Tree Geometry for", this.name);
        this.generator = new TreeGenerator(this.options, this.olam);
        const generated = this.generator.generate();
        
        this.treeGroup = generated.treeGroup;
        this.branches = generated.branches;
        this.leaves = generated.leaves;
    }

    async heescheel(olam, info) {
        this.olam = olam;
        
        // 1. Generate the Tree Geometry
        this.generateGeometry();
        
        // 2. Create Meshes
        await this.createMeshes();
        
        this.mesh = this.treeGroup;
        this.mesh.nivraAwtsmoos = this;
        
        // 3. Apply Transforms
        if(this.position) this.mesh.position.copy(this.position.vector3());
        if(this.rotation) {
             this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        }
        if(this.scale) this.mesh.scale.copy(this.scale.vector3());
        
        if(!this.mesh.userData) this.mesh.userData = {};
        if(this.itemData) this.mesh.userData.itemData = this.itemData;
        if(this.isSolid) this.mesh.userData.isSolid = true;

        this.mesh.updateMatrixWorld(true);
        
        // 4. Add to World Scene
        await olam.hoyseef(this);
        
        // 5. Create Invisible Physics Proxy
        if(this.isSolid) {
            const trunkHeight = this.options.branch.length[0];
            const trunkRadius = this.options.branch.radius[0];
            const proxyGeo = new THREE.CylinderGeometry(trunkRadius * 0.5, trunkRadius, trunkHeight, 8);
            proxyGeo.translate(0, trunkHeight/2, 0);
            
            const proxyMesh = new THREE.Mesh(proxyGeo, new THREE.MeshBasicMaterial({ visible: false }));
            
            proxyMesh.position.copy(this.mesh.position);
            proxyMesh.rotation.copy(this.mesh.rotation);
            proxyMesh.scale.copy(this.mesh.scale);
            proxyMesh.updateMatrixWorld(true);
            
            proxyMesh.userData = { 
                isSolid: true, 
                visualReference: this.mesh,
                itemData: this.itemData 
            };
            
            this.olam.worldOctree.addObject(proxyMesh);
        }
        
        this.isReady = true;
        this.ayshPeula("heescheel", this);
        return true;
    }

    async createMeshes() {
        if(!this.branches || !this.leaves) return;

        // --- BRANCHES ---
        const branchGeo = new THREE.BufferGeometry();
        branchGeo.setAttribute('position', new THREE.Float32BufferAttribute(this.branches.verts, 3));
        branchGeo.setAttribute('normal', new THREE.Float32BufferAttribute(this.branches.normals, 3));
        branchGeo.setAttribute('uv', new THREE.Float32BufferAttribute(this.branches.uvs, 2));
        branchGeo.setIndex(this.branches.indices);
        
        const branchMat = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.options.bark.tint || 0x8B4513), 
            roughness: 1.0,
            metalness: 0.0,
            flatShading: this.options.bark.flatShading
        }); 
        
        // --- LEAVES ---
        const leafGeo = new THREE.BufferGeometry();
        leafGeo.setAttribute('position', new THREE.Float32BufferAttribute(this.leaves.verts, 3));
        leafGeo.setAttribute('uv', new THREE.Float32BufferAttribute(this.leaves.uvs, 2));
        leafGeo.setIndex(this.leaves.indices);
        leafGeo.computeVertexNormals();
        
        // B"H: CRITICAL FIX - Initialize with Dummy Texture
        // This ensures the material has a valid map reference immediately, preventing shader issues.
        const dummyData = new Uint8Array([255, 255, 255, 255]); // White pixel
        const dummyTex = new THREE.DataTexture(dummyData, 1, 1, THREE.RGBAFormat);
        dummyTex.needsUpdate = true;

        this.leavesMaterial = new THREE.MeshStandardMaterial({
            color: this.options.leaves.tint || 0x228B22, 
            map: dummyTex, // Start with dummy
            side: THREE.DoubleSide,
            alphaTest: 0.5, 
            transparent: true, // Always true to handle cutout
            depthWrite: true,
            roughness: 0.8,
            metalness: 0.1
        });

        // B"H: Texture Loading
        if(this.olam) {
            // Load Bark
            const barkType = this.options.bark.type || 'oak';
            const barkCap = barkType.charAt(0).toUpperCase() + barkType.slice(1);
            const texScale = this.options.bark.textureScale || {x:1, y:1};
            
            const loadTex = (key) => {
                 const path = this.olam.getComponent("awtsmoos://barkTexture" + barkCap + key);
                 if(path) {
                     return this.olam.loadTexture({ url: path, shouldRepeat: true, repeatX: texScale.x, repeatY: texScale.y });
                 }
                 return Promise.resolve(null);
            };

            Promise.all([loadTex(""), loadTex("_normal")]).then(([col, nrm]) => {
                 if(col) branchMat.map = col;
                 if(nrm) branchMat.normalMap = nrm;
                 branchMat.needsUpdate = true;
            });

            // Load Leaves
            const leafType = this.options.leaves.type || 'oak';
            const leafCap = leafType.charAt(0).toUpperCase() + leafType.slice(1);
            const leafPath = this.olam.getComponent("awtsmoos://leafTexture" + leafCap);

            if(leafPath) {
                 this.olam.loadTexture({ url: leafPath })
                 .then(tex => {
                     if (tex) {
                         tex.colorSpace = THREE.SRGBColorSpace;
                         this.leavesMaterial.map = tex;
                         this.leavesMaterial.needsUpdate = true;
                     } 
                 })
                 .catch((e) => console.error("B\"H Tree Texture Fail", e));
            }
        }
        
        // B"H: Wind Shader Injection
        this.leavesMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <project_vertex>',
                `
                vec4 mvPosition = vec4( transformed, 1.0 );
                
                #ifdef USE_UV
                    float windStrength = 0.1;
                    float windSpeed = 1.5;
                    float windOffset = position.x + position.z;
                    // Use uv.y for vertical gradient if available, else 1.0
                    float h = uv.y; 
                    
                    float wind = sin(uTime * windSpeed + windOffset * 0.5) * windStrength * h;
                    mvPosition.x += wind;
                    mvPosition.z += wind * 0.5;
                #endif
                
                mvPosition = modelViewMatrix * mvPosition;
                gl_Position = projectionMatrix * mvPosition;
                `
            );
            this.leavesMaterial.userData.shader = shader;
        };
        
        const branches = new THREE.Mesh(branchGeo, branchMat);
        branches.castShadow = true;
        branches.receiveShadow = true;
        
        const leaves = new THREE.Mesh(leafGeo, this.leavesMaterial);
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        leaves.frustumCulled = false; // Prevent culling errors
        
        this.treeGroup.add(branches);
        this.treeGroup.add(leaves);
    }
}
