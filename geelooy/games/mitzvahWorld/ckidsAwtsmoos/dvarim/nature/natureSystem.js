
/**
 * B"H
 * Nature System - Manages Instanced Mesh painting
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class NatureSystem {
    constructor(olam) {
        this.olam = olam;
        this.pools = {}; 
        this.dummy = new THREE.Object3D();
        
        this.olam.on("heesHawvoos", (dt) => this.update(dt));
    }
    
    async initPool(type, maxInstances = 5000, modelPath) {
        if(this.pools[type]) return this.pools[type];
        
        // B"H: Determine model path based on type if not provided
        if(!modelPath) {
            switch(type) {
                case 'grass': modelPath = "awtsmoos://grassModel"; break;
                case 'rock1': modelPath = "awtsmoos://rockModel1"; break;
                case 'rock2': modelPath = "awtsmoos://rockModel2"; break;
                case 'rock3': modelPath = "awtsmoos://rockModel3"; break;
                case 'flower_blue': modelPath = "awtsmoos://flowerBlue"; break;
                case 'flower_yellow': modelPath = "awtsmoos://flowerYellow"; break;
                case 'flower_white': modelPath = "awtsmoos://flowerWhite"; break;
            }
        }

        let geometry, material;
        
        if (modelPath) {
            const actualPath = this.olam.getComponent(modelPath);
            if(actualPath) {
                try {
                    const gltf = await this.olam.boyrayNivra({ path: actualPath });
                    if (gltf && gltf.scene) {
                        const mesh = gltf.scene.getObjectByProperty('isMesh', true);
                        if(mesh) {
                            geometry = mesh.geometry;
                            material = mesh.material;
                            if(material.map) material.map.colorSpace = THREE.SRGBColorSpace;
                        }
                    }
                } catch(e) {
                    console.warn("B\"H: Nature asset failed to load, using fallback", modelPath);
                }
            }
        }
        
        // Fallback geometry if loading failed
        if (!geometry) {
             console.warn("B\"H: Using fallback geometry for", type);
             if(type.includes('grass')) {
                 geometry = new THREE.ConeGeometry(0.1, 0.5, 4);
                 geometry.translate(0, 0.25, 0);
                 material = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
             } else {
                 geometry = new THREE.DodecahedronGeometry(0.3);
                 material = new THREE.MeshLambertMaterial({ color: 0x888888 });
             }
        }
        
        // Wind shader for grass and flowers
        if (type === 'grass' || type.includes('flower')) {
             material = material.clone(); // Ensure unique material per type
             material.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = { value: 0 };
                shader.vertexShader = `
                uniform float uTime;
                ` + shader.vertexShader.replace('#include <project_vertex>', `
                    vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
                    float sway = sin(uTime * 2.0 + mvPosition.x * 0.5) * 0.2 * uv.y;
                    mvPosition.x += sway;
                    mvPosition = modelViewMatrix * mvPosition;
                    gl_Position = projectionMatrix * mvPosition;
                `);
                material.userData.shader = shader;
            };
        }

        const instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
        instancedMesh.count = 0;
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        instancedMesh.receiveShadow = true;
        instancedMesh.castShadow = true;
        instancedMesh.frustumCulled = false; // B"H: Prevent flickering until bounds calc is fixed
        
        this.olam.scene.add(instancedMesh);
        
        this.pools[type] = {
            mesh: instancedMesh,
            count: 0,
            max: maxInstances,
            material: material
        };
        
        return this.pools[type];
    }
    
    paint(type, position, density = 1) {
        // B"H: Randomize rock types if 'rock' is requested
        if (type === 'rock') {
            const rockTypes = ['rock1', 'rock2', 'rock3'];
            type = rockTypes[Math.floor(Math.random() * rockTypes.length)];
        }
        
        // B"H: Randomize flower types if 'flower' is requested
        if (type === 'flower') {
            const flowerTypes = ['flower_blue', 'flower_white', 'flower_yellow'];
            type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        }

        const pool = this.pools[type];
        if(!pool) {
            this.initPool(type).then(() => this.paint(type, position, density));
            return;
        }
        
        const range = 3; 
        const countToAdd = type.includes('rock') ? 1 : 5; // Rocks are sparser
        
        for(let i=0; i<countToAdd; i++) {
            if (pool.count >= pool.max) break;
            
            const offsetX = (Math.random() - 0.5) * range;
            const offsetZ = (Math.random() - 0.5) * range;
            
            this.dummy.position.set(position.x + offsetX, position.y, position.z + offsetZ);
            
            // Randomize rotation
            this.dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
            
            // Scale variation
            let scale = 1;
            // B"H FIX: Apply 0.1 scale to both grass and flowers
            if (type === 'grass' || type.includes('flower')) {
                 scale = 0.8 + Math.random() * 0.4;
                 // Base scale 0.1 because assets are huge
                 this.dummy.scale.set(
                     scale * 0.1, 
                     scale * 0.1 * (0.8 + Math.random() * 0.5), 
                     scale * 0.1
                 );
            } else if (type.includes('rock')) {
                 scale = 0.5 + Math.random() * 1.5;
                 this.dummy.scale.setScalar(scale);
            } 
            
            this.dummy.updateMatrix();
            pool.mesh.setMatrixAt(pool.count, this.dummy.matrix);
            pool.count++;
        }
        
        pool.mesh.count = pool.count;
        pool.mesh.instanceMatrix.needsUpdate = true;
    }
    
    update(dt) {
        for(const key in this.pools) {
            const mat = this.pools[key].material;
            if(mat && mat.userData.shader) {
                mat.userData.shader.uniforms.uTime.value += dt;
            }
        }
    }
}
