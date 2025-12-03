/**
 * B"H
 * 
 * Olam method for "creating" a nivra
 */

/**
     * The method 'boyrayNivra' creates a new instance of a creation, represented by the 'nivra' parameter.
     * The creation can be defined in two ways: by providing a path to a GLTF model, or by defining a 
     * primitive shape using Three.js geometries and materials.
     * If the creation is defined as a GLTF model, it's loaded and added to the scene, potentially to an Octree
     * if flagged as solid. If it's defined as a primitive, a new mesh is created based on the provided 
     * geometry and material parameters.
     *
     * @param {object} nivra - The creation object, either containing a 'path' property to load a GLTF model
     * or a 'golem' property to define a primitive shape.
     * @returns {Promise} A Promise resolving with either the loaded GLTF object or the created mesh.
     *
     * @example
     * var myNivra = { path: '/models/myModel.gltf', isSolid: true };
     * var createdNivra = await boyrayNivra(myNivra);
     * 
     * var myPrimitiveNivra = { 
     *    golem: { 
     *       guf: { BoxGeometry: [1, 1, 1] },
     *       toyr: { MeshLambertMaterial: { color: "white" } } 
     *    } 
     * };
     * var createdPrimitiveNivra = await boyrayNivra(myPrimitiveNivra);
     */

import Utils from '../../utils.js'

import * as THREE from '/games/scripts/build/three.module.js';

import { Octree } from '../math/AwtsmoosOctree.js';

import GeometryManager from '../math/GeometryManager.js';
export default class {
   
    isInWater(position) {
        if (!this.water) return null;
        var waterWorldPosition = null
        if(!this.globalWaterPosition) {
            // Get the global position of the water mesh
            waterWorldPosition = new THREE.Vector3();
            this.water.getWorldPosition(waterWorldPosition);
            this.globalWaterPosition = waterWorldPosition
        }
        waterWorldPosition = this.globalWaterPosition
        // Convert the given position to global if necessary
        const globalPosition = position.clone(); // Assuming position is a Vector3
        if(!this.temp) {
            this.temp = new THREE.Object3D();
        }
        var tempObject = this.temp // Use an intermediate object to transform to world
        tempObject.position.copy(position);
        tempObject.updateMatrixWorld(true); // Ensure world matrix is up to date
        globalPosition.copy(tempObject.getWorldPosition(new THREE.Vector3()));
    
    
        // Compare the global Y positions
        return globalPosition.y <= waterWorldPosition.y;
    }
    
    
    
    
    
    
    
    
    /**
     * B"H
     * Generates a Three.js mesh from a "golem" object definition. 
     * This version includes "Smart Box Mapping" logic. If the object is a BoxGeometry with a texture,
     * it automatically generates separate materials for the sides, top, and front. 
     * It calculates the correct texture repetition for each face based on the box's actual dimensions,
     * ensuring bricks tile perfectly on all sides without stretching or squashing.
     * @param {object} golem - The object defining the geometry, material, and texture properties.
     * @returns {Promise<THREE.Mesh>} A promise that resolves with the fully configured Three.js mesh.
     */
    /**
     * B"H
     * Generates a Three.js mesh from a "golem" object definition.
     * Supports standard THREE geometries and Custom Registered geometries.
     */
    async generateThreeJsMesh(golem) {
        const originalGolem = golem;
        if (!golem) golem = {};
        const self = this;

        const keyMap = {
            color: val => new THREE.Color(val),
            map: async (val) => await self.loadTexture({ url: val.startsWith("awtsmoos://") ? this.getComponent(val) : val })
        };

        // --- Geometry Creation ---
        const guf = golem.guf || golem.body || { "BoxGeometry": [1, 1, 1] };
        const gufEntries = Object.entries(guf);
        const geomType = gufEntries[0][0];
        const geomArgs = gufEntries[0][1];
        
        let chomer; // Geometry

        // B"H: Dynamic Geometry System
        if (GeometryManager.has(geomType)) {
            // 1. Check Custom Registry
            chomer = GeometryManager.create(geomType, geomArgs);
        } else if (THREE[geomType]) {
            // 2. Check Standard THREE
            chomer = new THREE[geomType](...geomArgs);
        } else {
            console.warn(`B"H: Geometry type ${geomType} not found. Defaulting to Box.`);
            chomer = new THREE.BoxGeometry(1,1,1);
        }

        // --- Material Creation ---
        const toyr = golem.toyr || golem.material || { "MeshLambertMaterial": { color: "white" } };
        const toyrEntries = Object.entries(toyr);
        let tzurah;
        const materialName = toyrEntries[0][0];
        const materialOptions = toyrEntries[0][1] || {};

        if (THREE[materialName] && chomer) {
            const optionPromises = [];
            const optionKeys = [];
            const finalOptions = {};

            for (const [key, value] of Object.entries(materialOptions)) {
                if (keyMap[key]) {
                    optionPromises.push(keyMap[key](value));
                    optionKeys.push(key);
                } else {
                    finalOptions[key] = value;
                }
            }

            const resolvedValues = await Promise.all(optionPromises);
            resolvedValues.forEach((value, index) => {
                finalOptions[optionKeys[index]] = value;
            });

            tzurah = new THREE[materialName](finalOptions);
        } else {
             throw "No model or valid geometry/material was given";
        }

        let mesh;

        // --- Mapping Logic ---
        // Smart mapping for BoxGeometry
        if (geomType === 'BoxGeometry' && tzurah.map && chomer.parameters) {
            const { width, height, depth } = chomer.parameters;
            const texFront = tzurah.map; 
            const texSide = texFront.clone(); 
            const texTop = texFront.clone(); 

            [texFront, texSide, texTop].forEach(t => {
                t.wrapS = THREE.RepeatWrapping;
                t.wrapT = THREE.RepeatWrapping;
                t.needsUpdate = true; 
            });

            texFront.repeat.set(width, height);
            texSide.repeat.set(depth, height);
            texTop.repeat.set(width, depth);

            const matFront = tzurah.clone(); matFront.map = texFront;
            const matSide = tzurah.clone(); matSide.map = texSide;
            const matTop = tzurah.clone(); matTop.map = texTop;

            mesh = new THREE.Mesh(chomer, [
                matSide, matSide, matTop, matTop, matFront, matFront 
            ]);

        } 
        // Custom Geometries usually handle their own UVs, but we apply wrapping
        else if (GeometryManager.has(geomType) && tzurah.map) {
            tzurah.map.wrapS = THREE.RepeatWrapping;
            tzurah.map.wrapT = THREE.RepeatWrapping;
            
            // Allow override from options
            if(golem.textureRepeat) {
                 tzurah.map.repeat.set(golem.textureRepeat.x, golem.textureRepeat.y);
            }
            mesh = new THREE.Mesh(chomer, tzurah);
        }
        else {
            mesh = new THREE.Mesh(chomer, tzurah);
            if (tzurah.map && golem.textureRepeat) {
                tzurah.map.wrapS = THREE.RepeatWrapping;
                tzurah.map.wrapT = THREE.RepeatWrapping;
                tzurah.map.repeat.set(golem.textureRepeat.x, golem.textureRepeat.y);
                tzurah.map.needsUpdate = true;
            }
        }

        mesh.awtsmoosGolem = originalGolem;
        return mesh;
    }
    
    
    
    
    async boyrayNivra/*createCreation*/(nivra, info) {
        try {
            
            if(
                nivra.path &&
                typeof(nivra.path) == "string"
            ) {
                var derech = nivra.path;
                
                // Check if the path starts with "awtsmoos://"
                if (nivra.path.startsWith('awtsmoos://')) {
                    // Extract the component name from the path
                    //var componentName = nivra.path.slice(11);
    
                    
                    // Get the component from the Olam
                    var component = this.getComponent(nivra.path);
                    
                    // If the component doesn't exist, fallback or error
                    if (!component) {
                        console.warn(`B"H: Component "${nivra.path}" not found. Fallback to primitive.`);
                        // B"H: Fallback to prevent crash
                        var fallbackGolem = {
                            guf: { BoxGeometry: [1, 2, 1] },
                            toyr: { MeshLambertMaterial: { color: 0xff0000, wireframe: true } } // Red wireframe to indicate error
                        };
                        var mesh = await this.generateThreeJsMesh(fallbackGolem);
                        mesh.userData.error = true;
                        return mesh;
                    }
    
                    // Use the component's data URL as the path
                    derech = component;
                   // nivra.path = derech;
                }
    
    
    
                /**
                 * If has path, load it as GLTF.
                 * If is primitive object. set it's model
                 * as a promitive
                 */
                
    
                /**
                 * check if GLTF has already
                 * been instantiated.
                 */
                var gltf = null;
                var gltfAsset = this.$ga(
                    "GLTF/" + derech
                );
                /**
                 * TODO officially clone gltf
                 * with skeleton utils
                 */
                
                
                if(0&&gltfAsset) {
                   // gltf = gltfAsset;
                } else { 
                    try {
                        
                        var lastTime = Date.now();
                        gltf = await new Promise((r,j) => {
                            // B"H: Ensure derech is valid string before loading
                            if (!derech || typeof derech !== 'string') {
                                j("Invalid model path (derech)");
                                return;
                            }

                            this.loader.load(derech, onloadParsed => {
                                r(onloadParsed)
                            },
                            async progress => {
                                var {
                                    loaded,
                                    total
                                } = progress;
                                var percent = loaded/total;
                                var nivrayimLng = info?.nivrayimMade?.length || 1;
                                var thisSize = nivra.size;
                                var totalSize = this.totalSize;
                                var sizeIncrement = (thisSize / totalSize);
                                var loadingPercentage = percent  * sizeIncrement;
                                await this.ayshPeula("increase loading percentage", {
                                    amount: 100 * loadingPercentage,
                                    action: "building nivra model: "+nivra.name
                                })
                                var time = Date.now() - lastTime
                                lastTime = Date.now()
                                
                            }, error => {
                                console.log(error);
                                r();
                            });
                        })
                    } catch(e) {
                        throw e;
                        console.log("Problem loading",e,gltfAsset)
                    }
                }
                
    
                if(!gltf) {
                    throw "Couldn't load model!"
                }
                
                if(!gltfAsset) {
                    this.setAsset(
                        "GLTF/"+derech,
                        gltf
                    );
                    
                }
                nivra.asset = gltf;
                var placeholders = {};
                var entities = {};
    
                var thingsToRemove = [];
                var materials = [];
                var totalChildren = 0;
    
                gltf.scene.traverse(child => {
                    totalChildren++
                });
                var boneChildren = {};
                var garments= {};
                var bodyParts = {};
                nivra.boneChildren = boneChildren;
                var lastParent = null;
                var currentChild = 0;
                gltf.scene.traverse(child => {
                    if(child.type == "Bone") {
                        lastParent = child;
                        boneChildren[child.name] = 
                            child;
                       
                    }
                    var gar = child?.userData?.garment;
                    if(gar) {
	                    garments[gar] = child;
                    }
                    var bodyPart = child?.userData?.["body-part"];
                    if(bodyPart) {
	                    bodyParts[bodyPart] = child;
                    }
                    currentChild++;
                    var loadingPercentage = currentChild / totalChildren;
                    this.ayshPeula("increase loading percentage", {
                        amount: 100 * loadingPercentage,
                        action: "Traversing: "+nivra.name + 
                        ".",
                        subAction: "Current Child #"+currentChild + " out of " + 
                            totalChildren
                        + ". Name: "
                        +child.name
                    });
                    child.nivraAwtsmoos = nivra;
                    if(child.type.toLowerCase().includes("light")) {
                        //this.enlightened = true;
                    }
                    if(child.userData && child.userData.water) {
                        child.isWater = true;
                        //child.isMesh = false;
                        this.ayshPeula("alert", "WATER IS HERE", child)
                        this.ayshPeula("start water", child);
                        this.ayshPeula("increase loading percentage", {
                            amount: 0,
                            action: "Adding water..."
                        });
                    }
    
                    if(child.userData.meen == "land") {
                        if(!nivra.lands) {
                            nivra.lands = [];
                        }
                        nivra.lands.push(child)
                    }
    
                    if(child.userData && child.userData.action) {
                        var ac = this.actions[child.userData.action];
                        
                        
                        if(ac) {
                            if(!nivra.childrenWithActions) {
                                nivra.childrenWithActions = [];
                            }
                            nivra.childrenWithActions.push(ac);
                            child.awtsmoosAction = (player, nivra) => ac(
                                player, nivra, this
                            );
                        }
                    }
                    /*
                        look for objects that
                        have the custom property "placeholder"
                        with the name of the nivra. for repeating
                        objects can have same name.
                    */
                    if(typeof(child.userData.placeholder) == "string") {
                        var {
                            position, rotation, scale
                        } = this.getTransformation(child)
                        
                        //console.log("Found placeholder",child)
                        /*
    
    
                            for example if i have
                            lots of coins I can 
                            add lots to the list for 
                            different positions
                        */
                        
                        if(!placeholders[child.userData.placeholder])
                            placeholders[child.userData.placeholder] = [];
    
                        var shlichus = child.userData.shlichus;
                        placeholders[child.userData.placeholder].push(
                            {
                                position, rotation, scale,
                                mesh: child,
                                addedTo: false,
                                ...(/**
                                    some objects
                                    only have placeholders
                                    for a specific mission.
                                */
                                    shlichus ? {
                                        shlichus
                                    } : {}
                                )
                            }
                        );
    
                        /*console.log("Added placeholder",child.userData.placeholder,
                        placeholders[child.userData.placeholder],
                        child,nivra)*/
                        thingsToRemove.push(child)
                        //gltf.scene.remove(child);
                        
    
                    }
    
                    /**
                     * deal with entities
                     */
                    if(
                        typeof(child.userData.entity)
                        == "string"
                    ) {
                        
                        this.saveEntityInNivra(child.userData.entity, nivra, child)
                         if(nivra.isSolid) {
                            child.isSolid = true;
                         }
                         child.isMesh = true;
                       //  console.log("Saved",nivra.entities,child.userData)
                    }
    
                    if(child.userData.remove) {
                      //  thingsToRemove.push(child)
                    }
    
                    
    
    
                    /*adds items that aren't player to special list
                    for camera collisions etc.*/
                    if (child.isMesh && !child.isAwduhm && !child.isWater) {
                        this.objectsInScene.push(child);
    
                    } else if(child.isWater ) {
                        this.water = child;
                        if(!this.waters) {
                            this.waters = []
                        }
                        this.waters.push(child);
                    }
    
                    if(child.isMesh) {
                        //shadows
                       // child.receiveShadow = true
                       // child.castShadow = true
                    }
    
                    /*
                        get materials of mesh for easy access later
                            */
                    if(child.material) {
                        var inv = child.userData.invisible
                        
                        //checkAndSetProperty(child, "invisible");
                        
                        
                        Utils.replaceMaterialWithLambert(child);
                        materials.push(child.material)
                        if(inv) {
                            child.material.visible = false;
                        }
                    }
    
                    
                });
                
                if(Object.keys(bodyParts).length) {
	                nivra.bodyParts = bodyParts
                }
                
                if(Object.keys(garments).length) {
	                nivra.garments = garments;
                }
                
                if(nivra.entities) {
                    
                    this.nivrayimWithEntities.push(nivra);
                }
                if(thingsToRemove.length) {
                    thingsToRemove.forEach(q => {
                        q.removeFromParent();
                    });
                    nivra.placeholders = placeholders;
                    
                    this.nivrayimWithPlaceholders.push(nivra);
                }
    
                
    
    
                /*if solid, add to octree*/
                if(nivra.isSolid) {
                    nivra.needsOctreeChange = true;
                    nivra.on(
                        "changeOctreePosition", () => {
                            var currentChild = 0;
                            gltf.scene.traverse(child => {
                                
                                currentChild++;
                                var loadingPercentage = currentChild / totalChildren;
                                this.ayshPeula(
                                    "increase loading percentage", 
                                    {
                                        amount:loadingPercentage * 100,
                                        nivra: nivra,
    
                                        subAction: "child #"
                                        +currentChild + " with name "
                                        +child.name +".",
                                        
                                        action: "Traversing nivra " +
                                        nivra.name + " to add children to octree."
                                    }
                                );
                                if(!child.isMesh) return;
                                if(child.isWater) return;
                                // --- B"H 
                                // Tag Loaded Objects for Physics & Collection ---
                            
	                            // 1. Essential: Link geometry to mesh so Octree Raycast returns the object
	                            if (child.geometry) {
	                                child.geometry.sourceMesh = child;
	                            }
	
	                            // 2. Ensure it has UserData
	                            if (!child.userData) child.userData = {};
	
	                            // 3. Tag as Solid
	                            child.userData.isSolid = true;
	
	                            // 4. Apply Item Data (So it can be collected)
	                            // If the parent Nivra has item data (from save file), pass it down.
	                            // If not, and it's a generic world block, give it a default tag so it's not "unclickable".
	                            if (!child.userData.itemData) {
	                                if (nivra.itemData) {
	                                    child.userData.itemData = nivra.itemData;
	                                } else {
	                                    // Fallback for generic world geometry
	                                    child.userData.itemData = {
	                                        id: "world_brick",
	                                        className: "Brick",
	                                        name: "Ancient Brick"
	                                    };
	                                }
	                            }
                                
                                
                                
                                
                                var isNotSolid = child.userData.notSolid;
                                if(!isNotSolid) {
                                    this.worldOctree.fromGraphNode(child);
                                }
                                
                                
                                /*var isAnywaysSolid = 
                                    checkAndSetProperty(child,
                                "isAnywaysSolid");
    
                                var has = checkAndSetProperty(child, "notSolid", 
                                "isAnywaysSolid");*/
                                //if does not have "not solid" to true, means !has IS solid
                                if(true) 
                                {
                                    
    
                                 //   child.layers.enable(2)
                                }
                                
    
    
                              //  console.log("About to add to octree", has,child,nivra)
                                
                            })
                        }
                    );
    
                    if(nivra.lands) {
                        nivra.landOctree = new Octree();
                        nivra.lands.forEach(w => {
                            nivra.landOctree.fromGraphNode(w)
                        })
                    }
                    
                }

    
               
    
                if(nivra.interactable) {
                    
                    this.interactableNivrayim
                    .push(nivra);
                   
                    
                    if(nivra.type != "chossid") { 
                        nivra.needsOctreeChange = true;
                        nivra.on(
                            "changeOctreePosition", () => {
                                var currentChild = 0;
                                gltf.scene.traverse(child => {
                                    this.interactiveOctree.fromGraphNode(child);
                                })
                            }
                        );
                    }
                }
    
    
                nivra.materials = materials;
                return gltf;
            } else {
                // This block is for primitive objects created via "golem".
                var golem = nivra.golem || {};
                var mesh = await this.generateThreeJsMesh(golem);
		mesh.name = nivra.name;
		
		    if (nivra.position) {
		        mesh.position.copy(nivra.position.vector3());
		    }
		    if (nivra.rotation) {
		        // Use Euler angles as your Domem class does
		        mesh.rotation.set(nivra.rotation.x || 0, nivra.rotation.y || 0, nivra.rotation.z || 0);
		    }
		    if (nivra.scale) {
		        mesh.scale.copy(nivra.scale.vector3());
		    }
		    
		    // VERY IMPORTANT: Update the mesh's world matrix after transforming it.
		    // The octree uses this matrix to get the final vertex positions for collision geometry.
		    mesh.updateMatrixWorld(true);
                if (nivra.isSolid) {
                    // This is a dynamic, solid object. Add it to the OctreeWorld synchronously.
                    // DO NOT use event listeners here. This must be immediate.
                    this.worldOctree.addObject(mesh);
                }

                if (nivra.interactable && nivra.type !== "chossid") {
                    // This is also a dynamic, interactive object.
                    // The interactiveOctree is simpler, so fromGraphNode is okay here.
                    this.interactiveOctree.fromGraphNode(mesh);
                }
                
                return mesh;
            }
              
                
            
        } catch(e) {
            console.log(e)
            throw e;
        }
    
            
    }
}

function checkAndSetProperty(obj, prop, exceptProp) {
    // If the object itself has the notSolid property set to true
    if (
        obj.userData && obj.userData[prop]
        && !obj.userData[exceptProp]
    ) {
        
        setPropToChildren(obj, prop);
      return true;
    }
  
    // Check its children
    for (let i = 0; i < obj.children.length; i++) {
        if(!obj.userData[exceptProp])
      if (checkAndSetProperty(obj.children[i]), prop) {
        return true;
      }
    }
  
    // If none of the children have the notSolid property set to true
    return false;
  }
  
  function setPropToChildren(obj, prop) {
    obj.traverse((child) => {
      if (!child.userData) {
        child.userData = {};
      }
      child.userData[prop] = true;
    });
  }