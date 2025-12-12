
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
        super(op, olam); 
        
        // B"H: Load Preset
        const presetName = op.itemData?.preset || op.preset || 'Oak Medium';
        this.options = JSON.parse(JSON.stringify(TreePresets[presetName] || TreePresets['Oak Medium']));
        
        // B"H: Allow seed override
        if(op.seed) this.options.seed = op.seed;
        else this.options.seed = Math.random() * 65536;
        
        /* B"H: WIND SHADER DISABLED FOR DIAGNOSTICS
        this.on("heesHawvoos", (dt) => {
            if(this.leavesMaterial && this.leavesMaterial.userData.shader) {
                 this.leavesMaterial.userData.shader.uniforms.uTime.value += dt;
            }
        });
        */
    }

    /**
     * B"H
     * Generates the tree data structures.
     */
    generateGeometry() {
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
            this.olam.interactiveOctree.fromGraphNode(proxyMesh);
        }
        
        this.isReady = true;
        this.ayshPeula("heescheel", this);
        return true;
    }
    
    // B"H: Create a MAGENTA placeholder to confirm mesh visibility immediately
    createPlaceholderTexture() {
        const width = 2;
        const height = 2;
        const size = width * height;
        const data = new Uint8Array(4 * size);

        // B"H: BRIGHT MAGENTA (255, 0, 255) to verify rendering
        const r = 255, g = 0, b = 255; 

        for (let i = 0; i < size; i++) {
            const stride = i * 4;
            data[stride] = r;
            data[stride + 1] = g;
            data[stride + 2] = b;
            data[stride + 3] = 255; // Fully Opaque
        }

        const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
        texture.needsUpdate = true;
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
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
        
        // B"H FIX: Use opaque placeholder texture immediately.
        const defaultTex = this.createPlaceholderTexture();

        // B"H FIX: Switch to MeshStandardMaterial to match branches and ensure lighting works.
        this.leavesMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: defaultTex,
            side: THREE.DoubleSide,
            alphaTest: 0.1, // Very low threshold to ensure pixels show up
            transparent: false,
            depthWrite: true, // Crucial for shadows
            roughness: 1.0,
            metalness: 0.0
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
                         console.log("B\"H Leaves Texture Loaded Successfully:", leafPath);
                         // B"H FIX: Swap texture and force update
                         tex.colorSpace = THREE.SRGBColorSpace;
                         this.leavesMaterial.map = tex;
                         this.leavesMaterial.alphaTest = 0.5; // Standard cutoff for leaf shapes
                         this.leavesMaterial.needsUpdate = true;
                     } 
                 })
                 .catch((e) => console.error("B\"H Tree Texture Fail", e));
            }
        }
        
        /* B"H: WIND SHADER DISABLED TEMPORARILY
           This eliminates the shader injection as a cause for invisible meshes.
        this.leavesMaterial.onBeforeCompile = (shader) => {
            // ...
        };
        */
        
        const branches = new THREE.Mesh(branchGeo, branchMat);
        branches.castShadow = true;
        branches.receiveShadow = true;
        
        const leaves = new THREE.Mesh(leafGeo, this.leavesMaterial);
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        
        // Debug Log
        console.log("B\"H Tree Created. Leaf Vertices:", leafGeo.attributes.position.count);
        
        this.treeGroup.add(branches);
        this.treeGroup.add(leaves);
    }
}
