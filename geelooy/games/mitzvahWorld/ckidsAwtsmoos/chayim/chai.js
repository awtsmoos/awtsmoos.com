/**
 * B"H
 */


import Tzomayach from "./tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';


import {Capsule} from '../Olam/math/Capsule.js';
import Utils from "../utils.js";

const SPHERE_RADIUS = 0.2;
const sphereGeometry = new THREE.IcosahedronGeometry( SPHERE_RADIUS, 5 );
const sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xdede8d } );
const _predictedPosition = new THREE.Vector3();
const _ground_check_ray = new THREE.Ray();
export default class Chai extends Tzomayach {
    type = "chai";
    rotationSpeed;
    distanceFromRay = 5;
    placementRotation = 0;
    speedScale = 1.4
    defaultSpeed = 127;
    rayAnchor = null;
    _speed = this.defaultSpeed;
    _originalSpeed = this._speed;
    _movementSpeed = this._speed;
    
    jumpHeight = 12

    get speed () {
        return this._speed;
    }

    set speed(v) {
        this._speed = v;
    }

    
    /**
     * The velocity vector of the character
     * @type {THREE.Vector3}
     */
    velocity = new THREE.Vector3();  // Added velocity property

    /**
     * Collider object for the character, for detecting and handling collisions
     * @type {Capsule}
     */
    collider;
   
    cameraRotation = null;

    offset = 0;
    gotOffset = false;
    lastRotateOffset = 0;
    rotateOffset = 0;
    currentModelVector = new THREE.Vector3();
    worldDirectionVector = new THREE.Vector3();
    worldSideDirectionVector = new THREE.Vector3();
    height = 0.75;
    radius = 0.35;

    lerpTurnSpeed = 0.145;
    targetRotateOffset = 0;

    empty;
    modelMesh = null;
    dontRotateMesh = false;
     /**
     * Flag to check if the character is on the floor
     * @type {Boolean}
     */
     onFloor = true;

     // Added moving property
     moving = {
        stridingLeft: false,
        stridingRight: false,
        forward: false,
        backward: false,
        turningLeft: false,
        turningRight: false,
        running: false,
        jump: false
    };

    /**
     * @method resetMoving
     * @description resets the moving object,
     * for use in a loop to keep track of 
     * if the character is currently moving or not.
     */
    resetMoving() {
        Object.keys(this.moving)
        .forEach(q => {
            this.moving[q] = false;
        })
    }
    movingAutomatically = false;
    isDancing = false;
    chaweeyoosMap = {
        run: () => this.moving.running ? 
            "run":"walk",
        idle: this.isDancing?"dance silly" :"stand",
        walk: "walk",
        jump: "jump",
        falling: "falling",
        "right turn": "right turn",
        "left turn": "left turn",
        "dance silly": "dance silly"
    }

    /**
     * @method chaweeyoos
     * @description selects the relevant
     * chaweeyoos (animation name) from the map to
     * be used with playChaweeyoos.
     * 
     * The difference between this and just
     * selecting it is regarding those animations
     * that have multiple possibilities and probabilities.
     */
    getChaweeyoos(nm) {
        var c = this.chaweeyoosMap[nm];
        if(!c) return null;
        if(typeof(c) == "string") {
            return c;
        }

        if(typeof(c) == "function") {
            return c();
        }
        if(typeof(c) == "object") {
            /**
             * select random index based on numbers.
             */
            var ran = Math.random();
            var sum = 0;
            var entries = Object.entries(c);
            var found = null;
            entries.forEach(q => {
                if(found !== null)
                    return found;
                if(
                    typeof(q[1]/*value*/) == "number" &&
                    q[1] <= 1
                ) {
                    sum += q[1]
                }
                if(ran <= sum) {
                    found = q[0];
                }
            });
            return found;
        }
    }
    
    updateDimensionsFromModel(model) {
        if (model || !this.modelMesh) return;

        // Calculate the bounding box of the visual model
        const box = new THREE.Box3().setFromObject(model || this.modelMesh);
        const size = new THREE.Vector3();
        box.getSize(size);

        // Update the height and radius based on the model's dimensions
        // Add a small vertical buffer to the height for the camera target
        this.height = size.y * 0.95; 
        this.radius = Math.max(size.x, size.z) / 2 * 0.8;
    }

    constructor(options) {
        super(options);
        this.rotationSpeed = options
            .rotationSpeed || 2;
        this.heesHawveh = true;
	    this.rayAnchor = new THREE.Group();
        this.height = options.height || this.height;
        this.radius = options.radius || this.radius;
        // Create a new collider for the character
        this.collider = new Capsule(
            new THREE.Vector3(0, this.height, 0), 
            new THREE.Vector3(0, this.height, 0), 
            this.radius
        );

        this.collider.nivraReference = this;

        var cm = options.chaweeyoosMap;
        if(cm && typeof(cm) == "object") {
            Object.keys(cm)
            .forEach(k => {
                this.chaweeyoosMap[k] = cm[k];

            })
        }

        this.on("collider transform update", ({
            position, rotation
        }) => {
            
          //  this.collider.start.set( position.x, 0.35, position.z );
          //  this.collider.end.set( position.x, 1, position.z );
        });
        
        // Additional properties can be set here
    }

    async heescheel(olam) {
        await super.heescheel(olam);
        
        // Implement Chai-specific behavior here
    }
	
	
	async afterBriyah() {
		await super.afterBriyah(this)
        this.disanceFromRay = 5;
	}

    async ready() {
        await super.ready();
        this.olam.scene.add(this.rayAnchor);
        this.speed = this.speed;
        this.animationSpeed = this.speed;
        var solid = Utils.getSolid(this.mesh);
        if(solid) {
            solid.visible = false;
        }
        /*set mesh to half down if has collider*/
        /*not really wokring just for test*/
        this.empty = new THREE.Group();
        this.olam.scene.add(this.empty);
        var pos = this?.mesh?.position;
        if(pos) {
            if(this?.empty?.position)
                this.empty.position.copy(pos);
        }
        this.modelMesh = this?.mesh;
        this.mesh = this.empty;
        this.emptyCopy = this.empty.clone();
        this.nonRotatingEmptyForMovement = this.empty.clone();
        this.olam.scene.add(this.emptyCopy);
        this.setPosition(this.mesh.position);
        
    }

    
   
	collisions() {
        // This function's sole purpose is to resolve collisions after a movement step.
        const result = this.olam.worldOctree.capsuleIntersect(this.collider);
    
        if (result) {
            // Correct the capsule's position out of the collided object.
            this.collider.translate(result.normal.multiplyScalar(result.depth));
    
            // Adjust the character's main velocity to slide along the wall, not stick to it.
            this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
        }
    }
    
    /**
     * Checks and handles collisions for the character
     * 
     * @param {number} deltaTime Time since the last frame
     */

  
    
    
    
    async calculateOffset() {
        if (!this.onFloor) {
            return;
        }
    
        // Wait for the next frame so that the collider's position is updated
        await new Promise(resolve => requestAnimationFrame(resolve));
    
        var raycaster = new THREE.Raycaster();
        raycaster.set(this.collider.start, new THREE.Vector3(0, -1, 0));
    
        var intersects = raycaster.intersectObjects(this.olam.scene.children, true);
        if (intersects.length > 0) {
            this.offset = intersects[0].distance;
        }

        
    }

    getCapsule() {
        if(!this.collider) {
            return null;
        }
        var radius = this.collider.radius;
        var height = this.collider.end.y - 
            this.collider.start.y;
        return {radius, height}
    }

    getModelVector() {
        return Utils.getForwardVector(
            this.modelMesh,
            this.currentModelVector
        );
    }
    getForwardVector() {
        return Utils.getForwardVector(
            this.nonRotatingEmptyForMovement,
            this.worldDirectionVector
        );
    }
    /**
     * Sets the position of the character's collider
     * 
     * @param {THREE.Vector3} vec3 Position to set
     */
    setPosition(vec3) {
        this.collider.start.set(
            vec3.x, 
            vec3.y + this.height / 2, 
            vec3.z
        );
        this.collider.end.set(
            vec3.x, 
            vec3.y + this.height, 
            vec3.z
        );
        this.collider.radius = this.radius;
        this.isTeleporting = true;
    }

    rays = [];
    // Function to update the ray and place/update the block on the ray
    // Function to update the ray and place/update the block on the ray
    

    spheres = [];
    updateSpheres(deltaTime) {
        this.spheres.forEach(s => {
            s.collider.center.addScaledVector( s.velocity, deltaTime );
            s.mesh.position.copy( s.collider.center );
            if(Date.now() - s.startTime > 300) {
                try {
                    s.mesh.removeFromParent();
                    var ind = this.spheres.indexOf(s);
                    if(ind > -1) {
                        this.spheres.splice(ind, 1)
                    }
                } catch(e) {

                }
            }
        })
    }

    makeSphere(letter, options={}) {
        var mesh;
        if(letter) {
            mesh = this.olam.makeNewHebrewLetter(letter, options);
        }
        if(!mesh)
            mesh = 
            new THREE.Mesh( sphereGeometry, sphereMaterial )
      
        var sphere = {
            mesh,
            collider: new THREE.Sphere( new THREE.Vector3( 0, - 100, 0 ), SPHERE_RADIUS ),
            velocity: new THREE.Vector3(),
            startTime: Date.now()
        }
        this.spheres.push(sphere);
        return sphere;
    }

    throwBall(letter, options) {
      //  console.log("HI",letter)
        var sphere = this.makeSphere(letter, options);
        
        var v = new THREE.Vector3();  
        var dir;
        if(this.olam.ayin.isFPS) {
            dir = this.olam.ayin.camera.getWorldDirection( v );
        } else {
            dir = this.currentModelVector; 
        }
    
        sphere
        .collider
        .center
        .copy( this.collider.end )
        .addScaledVector( dir/*direction*/, this.collider.radius * 1.5 );

        const impulse = 15 + 30;
        var quat = new THREE.Quaternion
        quat.setFromUnitVectors(
            new THREE.Vector3(0,0,1),
            dir.normalize()
        )

        //setting it upright
        let up = new THREE.Vector3(0, 1, 0);
        let right = new THREE.Vector3().crossVectors(up, dir).normalize();
        let adjustedUp = new THREE.Vector3().crossVectors(dir, right);

        let uprightQuaternion = new THREE.Quaternion();
        uprightQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), adjustedUp.normalize());

        quat.multiply(uprightQuaternion);
        sphere.mesh.quaternion.copy(quat)
        sphere.velocity.copy( dir ).multiplyScalar( impulse );


        this.olam.scene.add(sphere.mesh)
    }

    removeObject() {
        if(this.activeObject) {
            this.activeRay.mesh.remove(this.activeObject.mesh);
        }
    }
    
    /**
     * B"H
     * Collects the object currently pointed at by the ray.
     * Returns true if an object was successfully collected.
     */
    async collectObject() {
        // 1. Get the ray start and direction
        const origin = this.getRayStart();
        const direction = this.getRayDirection();

        // 2. Create a standard THREE.Raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.set(origin, direction);
        // B"H FIX: Set a hardcoded distance (e.g. 100) to ensure it works. 
        // Previously it tried to read a property that didn't exist.
        raycaster.far = 100; 

        // 3. Check intersections with the interactive Octree (or scene meshes)
        const intersects = raycaster.intersectObjects(this.olam.nivrayimGroup.children, true);

        if (intersects.length > 0) {
            // Get the first hit
            const hit = intersects[0];
            let object = hit.object;

            // B"H FIX: Climb up one level just in case we hit a child mesh of a group
            if (!object.userData.itemData && object.parent && object.parent.userData.itemData) {
                object = object.parent;
            }

            // Check if this object has metadata we can collect
            if (object.userData && (object.userData.itemData || object.userData.isSolid)) {
                
                // 4. Add back to inventory
                const itemData = object.userData.itemData || {
                    id: "brick_1x1x1", // Default fallback
                    className: "Brick",
                    quantity: 1
                };
                
                // Add 1 of this item to inventory
                this.inventory.addItem(itemData, 1);

                // 5. Remove from world
                if (object.nivraAwtsmoos) {
                    this.olam.sealayk(object.nivraAwtsmoos);
                } else {
                    object.removeFromParent();
                    // Also remove from physics octree if needed
                    if (this.olam.worldOctree) {
                        // Note: Standard meshes need to be removed from octree tracking if applicable
                        // This depends on your octree implementation details for removal
                    }
                }
                
                // Play a sound
                this.playSound("awtsmoos://dingSound", { volume: 0.5 });
                
                return true;
            }
        }
        return false;
    }

    /**
     * B"H
     * Aligns the active preview object to remain level with the world, especially in FPS mode.
     * This is the final version that correctly cancels out the camera's vertical tilt (pitch)
     * by applying an equal and opposite local rotation, accounting for the parent's coordinate system.
     * @returns {void}
     */
    alignObject() {
        if (!this.activeRay || !this.activeRay.group || !this.activeObject) return;

        // 1. Start with identity (no rotation)
        const finalQuaternion = new THREE.Quaternion();

        if (this.olam.ayin.isFPS) {
            // FPS Logic: Cancel out camera tilt
            const cameraEuler = new THREE.Euler().setFromQuaternion(this.olam.ayin.camera.quaternion, 'YXZ');
            // Create the tilt-correction quaternion
            const tiltCorrection = new THREE.Quaternion().setFromEuler(new THREE.Euler(cameraEuler.x, 0, 0));
            finalQuaternion.multiply(tiltCorrection);
        } 

        // 2. Apply User Rotation (The new part!)
        // Rotate around the UP axis (Y)
        const userRotQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.placementRotation);
        
        // Combine them: Apply user rotation on top of the stabilization
        finalQuaternion.multiply(userRotQuat);

        // Apply to mesh
        this.activeObject.mesh.quaternion.copy(finalQuaternion);
    }

	/**
     * B"H
     * Removes the active preview object (the ghost block) from wherever it is attached.
     * Updated to use .removeFromParent() to ensure it works correctly now that the block
     * is attached to the ray group instead of the main scene.
     */
    removeActiveObject() {
        if (this.activeObject && this.activeObject.mesh) {
            // Safety check: remove it from whatever parent it currently has (the ray group).
            if (this.activeObject.mesh.parent) {
                this.activeObject.mesh.removeFromParent();
            }
            
            // Also try removing from scene just in case legacy logic put it there.
            this.olam.scene.remove(this.activeObject.mesh);
            
            this.activeObject = null;
        }
    }


	/**
     * B"H
     * Sets the distance of the preview object along the ray (for mouse wheel scrolling).
     * This version consistently uses the positive Z-axis.
     * @param {number} distance - The new distance to set.
     */
    setDistanceFromRay(distance) {
        this.distanceFromRay = distance;
        if (this.activeObject && this.activeObject.mesh) {
            // --- THE FIX ---
            // Consistently position the block along the POSITIVE Z-axis.
            this.activeObject.mesh.position.z = this.distanceFromRay;
            // --- END OF FIX ---
        }
    }

   
   
   
   
    /**
     * B"H
     * Determines the action to take when the "Fire" button (Enter/Click) is pressed.
     * Behavior depends on the currently equipped item.
     */
    async shoot() {
        if (!this.activeRay) return;

        const slot = this.inventory.slots[this.selectedInventorySlot];

        // 1. BUILDING MODE
        if (slot && (slot.className === 'Brick' || slot.item === 'Brick')) {
            if (!this.activeObject) {
                // If ray is on but no block shown yet, show it
                await this.placeBlockOnRay();
            } else {
                // If block is shown, place it
                await this.placeObject();
            }
        } 
        // 2. COLLECTION MODE (The "Weapon")
        else if (slot && slot.className === 'Tool') {
            // Ensure we don't have a ghost block hanging around from a previous switch
            if (this.activeObject) {
                this.removeActiveObject();
            }
            
            // Attempt to collect the object being pointed at
            await this.collectObject();
        }
        // 3. SAFETY MODE (Empty hand or unknown item)
        else {
            // Do nothing (or trigger standard interaction like talking).
            // This prevents accidental deletion of the world.
            if (this.activeObject) {
                this.removeActiveObject();
            }
            console.log("Equip a Brick to build or a Tool to collect.");
        }
    }
    
    
    
    /**
     * B"H
     * Removes the ray and any active preview object from the scene.
     * This ensures all temporary objects are cleaned up correctly, allowing the ray to be toggled.
     */
    removeRay() {
        this.removeActiveObject();

        if (this.activeRay && this.activeRay.group && this.activeRay.group.parent) {
            this.activeRay.group.parent.remove(this.activeRay.group);
        }

        this.activeRay = null;
        this.olam.remove("setFPS");
    }

    
    /**
     * B"H
     * Gets the starting position of the ray in world space.
     * @returns {THREE.Vector3}
     */
    getRayStart() {
        // Starts the ray from the top of the character's collider.
        return this.collider.end.clone();
    }

    /**
     * B"H
     * Creates or removes the placement ray. This is the FINAL version that correctly handles
     * both FPS (-Z) and 3rd Person (+Z) forward conventions by conditionally rotating the ray's container.
     * @async
     * @param {number} [length=72] - The maximum length of the ray.
     */
    async makeRay(length = 72) {
        if (this.activeRay) {
            this.removeRay();
            return;
        }

        const rayGroup = new THREE.Group();
        const parent = this.olam.ayin.isFPS ? this.olam.ayin.camera : this.emptyCopy;
        parent.add(rayGroup);

        const worldStart = this.getRayStart();
        const localStart = parent.worldToLocal(worldStart.clone());
        rayGroup.position.copy(localStart);

        // --- THE FINAL ROTATION FIX ---
        if (this.olam.ayin.isFPS) {
            // The camera's forward is -Z. We rotate our group 180 degrees on the Y-axis
            // so that our group's local +Z axis aligns with the camera's -Z axis.
            rayGroup.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        }
        // In 3rd person, no local rotation is needed. The group's +Z will automatically
        // align with the parent model's +Z, which is already its forward direction.
        // --- END OF FIX ---

        const geometry = new THREE.CylinderGeometry(0.015, 0.015, length, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
        const cylinderMesh = new THREE.Mesh(geometry, material);

        // We now CONSISTENTLY use the positive Z-axis as "forward" for all children of the rayGroup.
        cylinderMesh.rotation.x = Math.PI / 2;
        cylinderMesh.position.z = length / 2;
        rayGroup.add(cylinderMesh);

        this.activeRay = { group: rayGroup, visual: cylinderMesh };

        this.olam.on("setFPS", () => {
            const hadObject = !!this.activeObject;
            this.removeRay();
            this.makeRay(length).then(() => {
                if (hadObject) this.placeBlockOnRay();
            });
        }, { once: true });
    }

    /**
     * B"H
     * Calculates the "forward" direction for the ray. This is the final, correct version.
     * @returns {THREE.Vector3} A normalized vector representing the forward direction.
     */
    getRayDirection() {
        const direction = new THREE.Vector3();
        if (this.olam.ayin.isFPS) {
            // In FPS, "forward" is the direction the camera is looking.
            this.olam.ayin.camera.getWorldDirection(direction);
        } else {
            // In 3rd person, "forward" is the Z-axis of the model, transformed by its world rotation.
            const forward = new THREE.Vector3(0, 0, 1);
            forward.applyQuaternion(this.modelMesh.quaternion);
            direction.copy(forward);
        }
        direction.y = 0; // Ensure the ray is always level.
        return direction.normalize();
    }

    
    

    /**
     * B"H
     * Creates and attaches a preview block.
     * UPDATED: Makes the ghost block semi-transparent so it doesn't look "stuck" or solid.
     */
    async placeBlockOnRay() {
        if (!this.activeRay || !this.activeRay.group) return;
        this.removeActiveObject();

        let blockDefinition;
        let itemData = null;

        const item = this.getActiveItem();
        if (item && (item.className === 'Brick' || item.item === 'Brick')) {
            try {
                const brickModule = await import('../dvarim/brick.js');
                const BrickClass = brickModule.default;
                const tempBrick = new BrickClass(item);
                blockDefinition = tempBrick.originalOptions.golem;
                
                itemData = { ...item };
                delete itemData.golem; 

            } catch (e) { console.error("Could not load brick module", e); }
        }
        
        if (!blockDefinition) {
            blockDefinition = this?.olam?.vars?.defaultBlock || {
                guf: { BoxGeometry: [1, 1, 1] },
                toyr: { MeshLambertMaterial: { color: "#a0522d" } }
            };
        }

        const mesh = await this.olam.generateThreeJsMesh(blockDefinition);
        if (!mesh) return;
        
        // --- GHOST MATERIAL FIX ---
        // Make the preview transparent
        const makeGhost = (mat) => {
            if(mat) {
                mat.transparent = true;
                mat.opacity = 0.6;
                mat.depthWrite = false; // Helps with rendering order for ghosts
            }
        };

        if (Array.isArray(mesh.material)) {
            mesh.material.forEach(makeGhost);
        } else {
            makeGhost(mesh.material);
        }
        // --------------------------

        mesh.awtsmoosGolem = blockDefinition;
        
        if (itemData) {
            mesh.userData.itemData = itemData;
        }

        this.activeObject = { mesh };
        
        // Reset to default distance if weird
        if(isNaN(this.distanceFromRay)) this.distanceFromRay = 5;
        
        this.activeObject.mesh.position.z = this.distanceFromRay;
        this.activeRay.group.add(this.activeObject.mesh);
        this.alignObject();
    }

    /**
     * B"H
     * Finalizes placement.
     * UPDATED: Uses consumeItem() to correctly reduce quantity even if the brick
     * is equipped in the Right Hand slot.
     */
    async placeObject() {
        if (!this.activeObject || !this.activeObject.mesh) return;

        // 1. Get the Active Item (from Equipment OR Hotbar)
        const activeItem = this.getActiveItem(); 
        
        // Safety check: ensure we are actually holding the brick we are placing
        // (Prevents edge cases where you switch items really fast)
        if (!activeItem || (activeItem.className !== 'Brick' && activeItem.item !== 'Brick')) return;

        const golem = this.activeObject.mesh.awtsmoosGolem;
        
        // Use the metadata from the ACTIVE item
        const itemData = activeItem; 

        if (!golem) return;

        // ... [Matrix decomposition code remains the same] ...
        this.activeObject.mesh.updateMatrixWorld(true);
        const worldPosition = new THREE.Vector3();
        const worldQuaternion = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        this.activeObject.mesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
        const worldRotation = new THREE.Euler().setFromQuaternion(worldQuaternion);

        // --- THIS IS THE FIX ---
        // Instead of manually clearing slots[i], we ask the manager to consume
        // the specific item object we are holding.
        this.inventory.consumeItem(activeItem, 1);
        // -----------------------

        const type = itemData.className || 'Domem';

        await this.olam.addObject(type, {
            position: worldPosition,
            scale: worldScale,
            rotation: worldRotation,
            golem, 
            itemData, 
            ...(itemData.dimensions ? { dimensions: itemData.dimensions } : {}),
            isSolid: true,
            interactable: true,
            name: "BH_permanent_block_" + Date.now()
        });

        // If we ran out of items (activeItem is now null or removed), remove the preview
        if (!this.getActiveItem()) {
            this.removeRay();
        } else {
            this.removeActiveObject(); 
        }
    }
    
    
    rotatePreview() {
	    // Increment by 90 degrees (PI/2)
	    this.placementRotation += Math.PI / 2;
	    // Normalize to keep it simple (0 to 2PI)
	    this.placementRotation %= (Math.PI * 2);
	    
	    // Re-run alignment to apply it immediately
	    this.alignObject();
	}
	
	resetPreviewRotation() {
	    this.placementRotation = 0;
	    this.alignObject();
	}
	
	
	
	/**
     * B"H
     * Helper to get the currently active item.
     *  Only checks Equipment. No fallback to hotbar.
     */
    getActiveItem() {
        if (!this.inventory) return null;
        
        // Only return what is explicitly equipped in the right hand.
        if (this.inventory.equipment && this.inventory.equipment.rightHand) {
            return this.inventory.equipment.rightHand;
        }

        return null;
    }

    /**
     * B"H
     * Updated to check the Active Item (Equipment).
     */
    updateHandState() {
        const item = this.getActiveItem();
        
        // Simple tracker to detect changes (using ID instead of slot index now)
        const currentId = item ? item.id : "empty";
        if (this.lastItemId !== currentId) {
            this.lastItemId = currentId;
            this.removeActiveObject(); // Reset preview on swap
        }

        if (!this.activeRay) return;

        if (item && (item.className === 'Brick' || item.item === 'Brick')) {
            if (!this.activeObject) {
                this.placeBlockOnRay();
            }
        } else {
            this.removeActiveObject();
        }
    }

    /**
     * B"H
     * Updated to check the Active Item for Tools.
     */
    async shoot() {
        if (!this.activeRay) return;

        const item = this.getActiveItem();

        if (item && (item.className === 'Brick' || item.item === 'Brick')) {
            if (!this.activeObject) {
                await this.placeBlockOnRay();
            } else {
                await this.placeObject();
            }
        } 
        else if (item && item.className === 'Tool') {
            if (this.activeObject) this.removeActiveObject();
            await this.collectObject();
        }
        else {
            if (this.activeObject) this.removeActiveObject();
            console.log("Hand is empty.");
        }
    }

    /**
     * B"H
     * Updated to color ray based on Equipment.
     */
    updateRayColor() {
        if (!this.activeRay || !this.activeRay.visual) return;

        const item = this.getActiveItem();
        const mat = this.activeRay.visual.material;

        if (item && (item.className === 'Brick' || item.item === 'Brick')) {
            mat.color.setHex(0x0000ff); // Blue (Build)
            mat.opacity = 0.5;
        } else if (item && item.className === 'Tool') {
            mat.color.setHex(0xff0000); // Red (Collect/Weapon)
            mat.opacity = 0.8;
        } else {
            mat.color.setHex(0xffffff);
            mat.opacity = 0.1;
        }
    }
    
    /**
     * B"H
     * Updated highlight logic.
     */
    updateBlockHighlight() {
        // Cleanup previous
        if (this.currentHighlighted) {
            if (this.currentHighlighted.material && this.currentHighlighted.savedEmissive) {
                this.currentHighlighted.material.emissive.copy(this.currentHighlighted.savedEmissive);
            }
            this.currentHighlighted = null;
        }

        const item = this.getActiveItem();
        if (!item || item.className !== 'Tool') return;

        const origin = this.getRayStart();
        const direction = this.getRayDirection();
        const raycaster = new THREE.Raycaster();
        raycaster.set(origin, direction);
        raycaster.far = this.activeRay ? this.activeRay.length : 15;

        const intersects = raycaster.intersectObjects(this.olam.nivrayimGroup.children, true);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const obj = hit.object;
            // Highlight logic
            if (obj.userData && (obj.userData.itemData || obj.userData.isSolid)) {
                this.currentHighlighted = obj;
                if (!obj.savedEmissive) {
                    obj.savedEmissive = obj.material.emissive.clone();
                }
                obj.material.emissive.setHex(0xff0000); 
            }
        }
    }
	
	
	
	
	
	
   

   
        

    
    



    resetJump = false;
    jumped = false;

    fallingFrames = 0
    heesHawvoos(dt) {
	// Clamp deltaTime to prevent physics explosions.
	const deltaTime = Math.min(dt, 0.1);
	
	super.heesHawvoos(deltaTime);
	if (this.isTeleporting) {
		this.isTeleporting = false;
		return;
	}
	
	// --- HAND, RAY & HIGHLIGHT UPDATES ---
        this.updateRayColor();      // Color the ray beam
        this.updateHandState();     // Manage ghost block
        this.updateBlockHighlight();// Manage red glow on existing blocks
        // -------------------------------------

	// --- 1. PRE-MOVEMENT GROUND CHECK (Your original code) ---
	const steepSlopeAngle = Math.cos(THREE.MathUtils.degToRad(50));
	_ground_check_ray.origin.copy(this.collider.start);
	_ground_check_ray.direction.set(0, -1, 0);
	const groundHit = this.olam.worldOctree.rayIntersect(_ground_check_ray);
	this.onFloor = groundHit && groundHit.normal.y > steepSlopeAngle && groundHit.distance <= this.radius + 0.25;


	// --- 2. GATHER USER INPUT & APPLY FORCES (Your original code) ---
	let damping = Math.exp(-20 * deltaTime) - 1;
	if (!this.onFloor) {
		this.velocity.y -= this.olam.GRAVITY * deltaTime;
		const airDamping = damping * 0.1;
		this.velocity.x += this.velocity.x * airDamping;
		this.velocity.z += this.velocity.z * airDamping;
	}
	else {
		this.velocity.addScaledVector(this.velocity, damping);
	}

	var speedDelta = deltaTime * (this.onFloor ? (this.speed * this.speedScale) : 8);
	if (!this.moving.running) {
		speedDelta *= 0.5;
	}

	let combinedVector = new THREE.Vector3();
	var isWalking = false; // We will use this variable later for the slope fix
	var isWalkingForOrBack = false;
	var isWalkingForward = false;
	var isWalkingBack = false;
	var isTurning = false;
	var velocityAddAmounts = [];
	if (this.moving.forward || this.movingAutomatically) {
		isWalking = true;
		isWalkingForOrBack = true;
		isWalkingForward = true;
		velocityAddAmounts.push([this.getForwardVector(), speedDelta]);
		this.targetRotateOffset = 0;
	}
	else if (this.moving.backward) {
		isWalking = true;
		isWalkingForOrBack = true;
		isWalkingBack = true;
		velocityAddAmounts.push([this.getForwardVector(), -speedDelta]);
		this.targetRotateOffset = -Math.PI;
	}
	if (this.moving.stridingLeft) {
		isWalking = true;
		velocityAddAmounts.push([Utils.getSideVector(this.nonRotatingEmptyForMovement, this.worldSideDirectionVector), -speedDelta]);
		this.targetRotateOffset = Math.PI / 2;
		if (isWalkingForward) {
			this.targetRotateOffset -= Math.PI / 4
		}
		else if (isWalkingBack) {
			this.targetRotateOffset += Math.PI / 4
		}
	}
	else if (this.moving.stridingRight) {
		isWalking = true;
		velocityAddAmounts.push([Utils.getSideVector(this.nonRotatingEmptyForMovement, this.worldSideDirectionVector), speedDelta]);
		this.targetRotateOffset = -Math.PI / 2;
		if (isWalkingForward) {
			this.targetRotateOffset += Math.PI / 4
		}
		else if (isWalkingBack) {
			this.targetRotateOffset -= Math.PI / 4
		}
	}

	velocityAddAmounts.forEach(q => {
		combinedVector.add(q[0].clone()
			.multiplyScalar(q[1]));
	});
	let totalMagnitude = combinedVector.length();
	let maxMagnitude = Math.abs(speedDelta);
	let scalingFactor = (totalMagnitude > maxMagnitude) ? (maxMagnitude / totalMagnitude) : 1;
	combinedVector.multiplyScalar(scalingFactor);

	this.velocity.x += combinedVector.x;
	this.velocity.z += combinedVector.z;


	// --- 3. JUMP LOGIC ---
	if (this.onFloor && this.moving.jump) {
		this.jumped = true;
		this.velocity.y = this.jumpHeight;
		if (!this.didJump) {
			this.didJump = true;
			this.ayshPeula("jumped", this)
		}
	}
	else {
		if (this.didJump) {
			this.didJump = false;
		}
	}
    


	// --- 4. SUB-STEPPED MOVEMENT & COLLISION (Your original code) ---
	const deltaPosition = this.velocity.clone()
		.multiplyScalar(deltaTime);
	this.olam.worldOctree?.update?.(this.collider.end, this.velocity);

	const capsule = this.collider;
	const numSteps = Math.ceil(deltaPosition.length() / (capsule.radius * 0.5));

	if (numSteps > 1) {
		const stepDelta = deltaPosition.clone()
			.divideScalar(numSteps);
		for (let i = 0; i < numSteps; i++) {
			capsule.translate(stepDelta);
			this.collisions();
		}
	}
	else {
		capsule.translate(deltaPosition);
		this.collisions();
	}
	// After all movement, we do a final check to stick to the ground.
	const finalGroundHit = this.olam.worldOctree.rayIntersect(_ground_check_ray);
	this.onFloor = finalGroundHit && finalGroundHit.normal.y > steepSlopeAngle && finalGroundHit.distance <= this.radius + 0.25;

	if (this.onFloor && this.velocity.y <= 0) {

		// --- POSITIONAL CORRECTION FIRST ---
		// First, fix any penetration. This is more robust than the old snapping.
		// It calculates how deep we are inside the ground and pushes us out along the slope's normal.
		const penetrationDepth = this.radius - finalGroundHit.distance;
		if (penetrationDepth > 0) {
			this.collider.translate(finalGroundHit.normal.clone().multiplyScalar(penetrationDepth));
		}

		// --- VELOCITY CORRECTION SECOND ---
		// Now that position is correct, we can safely calculate the velocity for the next frame.
		this.velocity.projectOnPlane(finalGroundHit.normal);

		// If not moving, apply friction to STICK to the slope.
		if (!isWalking && !this.moving.jump) {
			this.velocity.x = 0;
			this.velocity.z = 0;
		}
		
		// Ensure vertical velocity is zeroed out after corrections.
		this.velocity.y = 0;
	}


	// --- 6. ANIMATION LOGIC (Your original code, untouched) ---
	var rotationSpeed = this.rotationSpeed * deltaTime
	if (this.moving.turningLeft) {
		if (!isWalking && this.onFloor) {
			this.playChaweeyoos(this.getChaweeyoos("left turn"));
			isTurning = true;
		}
		this.rotation.y += rotationSpeed;
		this.ayshPeula("rotate", this.rotation.y);
	}
	else if (this.moving.turningRight) {
		if (!isWalking && this.onFloor) {
			this.playChaweeyoos(this.getChaweeyoos("right turn"));
			isTurning = true;
		}
		this.rotation.y -= rotationSpeed;
		this.ayshPeula("rotate", this.rotation.y);
	}

	if (this.onFloor) {
		if (this.jumped && !this.moving.jump) {
			this.jumped = false;
			if (!this.hitFloor) {
				this.hitFloor = true;
				this.ayshPeula("hit floor", this)
			}
		}
		if (isWalking) {
			this.playChaweeyoos(this.getChaweeyoos("run"));
			if (!this.startedWalking) {
				this.startedWalking = true;
				this.ayshPeula("started walking", this)
			}
		}
		else if (!isTurning) {
			this.playChaweeyoos(this.getChaweeyoos("idle"));
		}
		if (!isWalking) {
			if (this.startedWalking) {
				this.startedWalking = false;
				this.ayshPeula("stopped walking", this)
			}
		}
		this.fallingFrames = 0;
	}
	else {
		if (this.startedWalking) {
			this.startedWalking = false;
			this.ayshPeula("stopped walking", this)
		}
		if (this.velocity.y > 0 && this.jumped) {
			this.fallingFrames = 0;
			this.playChaweeyoos(this.getChaweeyoos("jump"), {
				loop: false
			});
		}
		else if (this.jumped && this.velocity.y < -9) {
			this.playChaweeyoos(this.getChaweeyoos("falling"));
			this.fallingFrames = 0;
		}
		else if (!this.jumped && this.velocity.y < -3) {
			if (++this.fallingFrames > 14) {
				this.playChaweeyoos(this.getChaweeyoos("falling"));
			}
		}
	}

	// --- 7. MESH UPDATES (Your original code, untouched) ---
	this.mesh.position.copy(this.collider.start);
	this.mesh.position.y -= this.radius;
	this.mesh.rotation.y = this.rotation.y;
	if (this?.emptyCopy?.rotation) this.emptyCopy.rotation.copy(this.mesh.rotation);
	if (this?.nonRotatingEmptyForMovement?.rotation) this.nonRotatingEmptyForMovement.rotation.copy(this.mesh.rotation);

	let angularDistance = this.targetRotateOffset - this.rotateOffset;
	if (angularDistance > Math.PI) {
		angularDistance -= 2 * Math.PI;
	}
	else if (angularDistance < -Math.PI) {
		angularDistance += 2 * Math.PI;
	}
	if (Math.abs(angularDistance - Math.PI) < 0.01) {
		angularDistance = -Math.PI;
	}
	this.rotateOffset += angularDistance * this.lerpTurnSpeed;
	if (this.rotateOffset > Math.PI) {
		this.rotateOffset -= 2 * Math.PI;
	}
	else if (this.rotateOffset < -Math.PI) {
		this.rotateOffset += 2 * Math.PI;
	}

	this.modelMesh.rotation.y = this.rotation.y + this.rotateOffset;
	if (this.lastRotateOffset !== this.rotateOffset) {
		this.ayshPeula("rotate", this.modelMesh.rotation.y);
		this.lastRotateOffset = this.rotateOffset;
	}

	this.modelMesh.position.copy(this.mesh.position);
	this.emptyCopy.position.copy(this.mesh.position);
	this.nonRotatingEmptyForMovement.position.copy(this.mesh.position);
	this.emptyCopy.rotation.copy(this.modelMesh.rotation);



	if (this.activeRay && this.olam.ayin.isFPS) {
	        const camera = this.olam.ayin.camera;
	        this.rayAnchor.position.copy(camera.position);
	
	        // We only want the horizontal (Y-axis) rotation from the camera.
	        // We create a temporary Euler angle to isolate it, preventing the anchor from tilting.
	        const cameraEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
	        this.rayAnchor.rotation.y = cameraEuler.y;
	    }
    // This was the call you correctly pointed out I had removed. It is preserved here.
	this.updateSpheres(deltaTime);
	if (this.activeObject) {
	        this.alignObject();
	    }
	if (isNaN(this.mesh.position.x) || isNaN(this.mesh.position.y) || isNaN(this.mesh.position.z)) {
		console.error("!!! FATAL: Player position became NaN. Physics explosion detected!", {
			pos: this.mesh.position,
			vel: this.velocity
		});
		throw new Error("Player position is NaN!");
	}
}
}
