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
    speedScale = 1.4
    defaultSpeed = 127;
    _speed = this.defaultSpeed;
    _originalSpeed = this._speed;
    _movementSpeed = this._speed;
    
    jumpHeight = 16

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
    alignObject() {
        if (this.activeObject) {
            this.activeObject.mesh.lookAt(this.mesh.position);
            // Align the block's Y rotation with the camera's Y rotation (horizontal rotation only)
            this.activeObject.mesh.rotation.x = 0
        }
    }
    
    
	async placeObject() {
    if (!this.activeObject || !this.activeObject.mesh) return;

    const golem = this.activeObject.mesh.awtsmoosGolem;
    if (!golem) return;

    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    this.activeObject.mesh.getWorldPosition(position);
    this.activeObject.mesh.getWorldScale(scale);

    // Get rotation directly from the source of truth for the character's facing direction.
    // This works for both 1st and 3rd person.
   
    this.activeObject.mesh.lookAt(this.mesh.position);
    this.activeObject.mesh.rotation.x = 0;
    if (this.inventory && this.selectedInventorySlot !== null) {
        const slot = this.inventory.slots[this.selectedInventorySlot];
        if (slot && slot.item === 'Brick') {
            this.inventory.removeItem(this.selectedInventorySlot, 1);
            if (!this.inventory.slots[this.selectedInventorySlot]) {
                this.selectedInventorySlot = null;
            }
        }
    }

    // --- B"H ---
    // CALL THE NEW, DEDICATED METHOD
    await this.olam.addObject('Domem', {
        // We no longer need a dynamic name for the key inside the method
        position,
        scale,
        rotation,
        golem,
        isSolid: true,
        interactable: true,
        name: "BH_permanent_block_" + Date.now()
    });
    // --- B"H ---

    this.removeObject();
    this.activeObject = null;
}



    removeRay() {
        // Remove existing ray and associated object
        if (this.activeObject) {
            this.placeObject();
        }
    
        if (this.olam.ayin.isFPS) {
            this.olam.ayin.camera.remove(this.activeRay.mesh); // Remove from camera in FPS mode
        } else {
            this.emptyCopy.remove(this.activeRay.mesh); // Remove from modelMesh in third-person mode
        }
    
        this.activeRay = null;
        this.olam.remove("setFPS")
    }
    async makeRay(length = 72) {
        // Get the starting position of the ray
        var start = this.getRayStart();
        
        // Determine the direction based on FPS or third-person mode
        var direction = this.getRayDirection();
        if (this.activeRay) {
            this.removeRay()
            return; // Exit after toggling off
        }
        
        // Create a new ray
        this.activeRay = {
            mesh: null,
            direction,
            length,
            start
        };
        
        // Create ray geometry and material
        const geometry = new THREE.CylinderGeometry(0.015, 0.015, length, 8); // Thin beam
        geometry.translate(0, -length / 2, 0); // Shift geometry so the base is at the origin
        
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Set the ray's initial position and parenting based on FPS mode
        if (this.olam.ayin.isFPS) {
            // FPS mode: parent to the camera
            
            const localPosition = this.olam.ayin.camera.worldToLocal(
                this.olam.ayin.camera.position.clone()
            );
            mesh.position.copy(localPosition);
            mesh.position.y -= 0.13
            this.olam.ayin.camera.add(mesh);
        } else {
            // Third-person mode: parent to the modelMesh
            const localPosition = this.modelMesh.worldToLocal(start.clone());
            mesh.position.copy(localPosition);
            this.emptyCopy.add(mesh);
        }
        
        // In FPS mode, we don't use lookAt; we directly align the ray with the camera's forward vector
        if (this.olam.ayin.isFPS) {
           mesh.rotateX(Math.PI / 2); // Align cylinder's Y-axis with ray's direction
        
        } else {
            // Third-person mode: align the ray's rotation towards the direction of the ray
            const lookAtTarget = start.clone().add(direction.clone().multiplyScalar(length)); // Point in the direction
            mesh.lookAt(lookAtTarget); // Adjust for third-person mode
            mesh.rotateX(Math.PI / 2); // Align cylinder's Y-axis with ray's direction
        }
        
        // Store the ray's mesh
        this.activeRay.mesh = mesh;
      
        this.olam.on("setFPS", () => {
            /**
             * switch the ray to what
             * it should be depending on if
             * isFPS is on or not.
             */
            // Listen for FPS mode change and update the ray
        
            // Switch logic for FPS mode change
            var hadObject = false;
            // Remove existing ray and associated object
            if (this.activeObject) {
                hadObject = true;
                this.removeObject();
                this.activeObject = null;
            }
        
            this.activeRay.mesh.removeFromParent();
        
            this.activeRay = null;
            this.olam.remove("setFPS")
            this.makeRay(length)
            if(hadObject) {
                this.placeBlockOnRay()
            }
            
        })
        
        
        return this.activeRay;
    }

    getRayStart() {
        return this.collider.end.clone(); // Starting position for the ray
    }
    getRayDirection() {
        return this.olam.ayin.isFPS
            ? this.olam
                .ayin
                .camera
                .getWorldDirection(new THREE.Vector3())
                .normalize()
                .multiplyScalar(-1) // Camera forward direction in FPS
            : new THREE.Vector3(0, 0, -1)
                .applyQuaternion(this.modelMesh.quaternion)
                .normalize(); // Non-FPS forward direction
        
    }
    async shoot() {
        if(!this.activeRay) return;
        if (!this.activeObject) {
            await this.placeBlockOnRay();
        } else {
            this.placeObject();
        }
    }
    async placeBlockOnRay() {
	    if (!this.activeRay) return;
	
	    let blockDefinition;
	    let itemUsedInfo = null;
	
	    // Check if the player has an item selected from the inventory
	    if (this.inventory && this.selectedInventorySlot !== null) {
	        const slot = this.inventory.slots[this.selectedInventorySlot];
	        // For now, we only check for "Brick", but this can be expanded
	        if (slot && slot.item === 'Brick') {
	            try {
	                // Dynamically import the Brick class to access its properties
	                const brickModule = await import('../dvarim/brick.js');
	                const brickClass = brickModule.default;
	                
	                // Create a temporary instance to get its default golem
	                const tempBrick = new brickClass({});
	                blockDefinition = tempBrick.originalOptions.golem;
	                
	                itemUsedInfo = {
	                    slotIndex: this.selectedInventorySlot,
	                    className: slot.item
	                };
	
	            } catch (e) {
	                console.error("Could not load brick module for building", e);
	            }
	        }
	    }
	
	    // If no inventory item is used, fall back to the default block
	    if (!blockDefinition) {
	        blockDefinition = this?.olam?.vars?.defaultBlock || {
	            toyr: { MeshLambertMaterial: { color: "blue" } }
	        };
	    }
	    
	    const rayStart = this.getRayStart();
	    const rayDirection = this.getRayDirection();
	    const distance = this.distanceFromRay;
	
	    const worldPosition = rayStart.clone().add(rayDirection.clone().multiplyScalar(-distance));
	    const mesh = await this.olam.generateThreeJsMesh(blockDefinition);
	    if (!mesh) return;
	
	    const block = { mesh };
	
	    // Set scale to 1x1x1 for bricks, otherwise use the old default
	    if (itemUsedInfo) {
	        block.mesh.scale.set(1, 1, 1);
	    } else {
	        block.mesh.scale.set(3, 3, 2);
	    }
	
	    const localPosition = this.activeRay.mesh.worldToLocal(worldPosition.clone());
	    block.mesh.position.copy(localPosition);
	    this.activeRay.mesh.add(block.mesh);
	    this.activeObject = block;
	    this.alignObject();
	    
	    // NOTE: The item is removed from inventory when it's permanently placed,
	    // which happens in the placeObject() method. Let's modify that next.
	}

    async setDistanceFromRay(distance) {
        if (!this.activeObject || !this.activeRay) return;
    
        // Get the ray's direction and start point
        const rayStart = this.getRayStart()
        const rayDirection = this.getRayDirection();
    
        // Calculate the new position along the ray
        const newWorldPosition = rayStart.add(rayDirection.multiplyScalar(-distance));
    
        // Convert the new world position to the ray's local space
        const newLocalPosition = this.activeRay.mesh.worldToLocal(newWorldPosition.clone());
    
        // Update the block's position
        this.activeObject.mesh.position.copy(newLocalPosition);
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

    // This was the call you correctly pointed out I had removed. It is preserved here.
	this.updateSpheres(deltaTime);

	if (isNaN(this.mesh.position.x) || isNaN(this.mesh.position.y) || isNaN(this.mesh.position.z)) {
		console.error("!!! FATAL: Player position became NaN. Physics explosion detected!", {
			pos: this.mesh.position,
			vel: this.velocity
		});
		throw new Error("Player position is NaN!");
	}
}
}
